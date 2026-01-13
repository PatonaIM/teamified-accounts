import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Container,
  Fade,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Link,
  keyframes,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  AutoAwesome,
  Login as LoginIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { clientAdminSignup, analyzeWebsite, retryAtsProvisioning } from '../services/authService';
import type { SignupResponse } from '../services/authService';
import CountrySelect, { countries } from '../components/CountrySelect';
import PhoneInput from '../components/PhoneInput';
import PasswordRequirements, { isPasswordValid } from '../components/PasswordRequirements';
import { isValidPhoneNumber } from 'libphonenumber-js';
import RolesMultiSelect from '../components/RolesMultiSelect';

const COMPANY_SIZES = [
  '1-20 employees',
  '21-50 employees',
  '51-100 employees',
  '101-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Consulting',
  'Real Estate',
  'Media & Entertainment',
  'Other',
];

const sparkle = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
`;

const getServiceAgreementUrl = (countryCode: string): string => {
  const regionMap: Record<string, string> = {
    AU: 'au',
    GB: 'uk',
    US: 'us',
  };
  // Default to AU for any other country
  const region = regionMap[countryCode] || 'au';
  return `https://teamified.com/service-agreement?region=${region}`;
};

const getServiceAgreementLabel = (countryCode: string): string => {
  const labelMap: Record<string, string> = {
    AU: 'Service Agreement (AU)',
    GB: 'Service Agreement (UK)',
    US: 'Service Agreement (US)',
  };
  // Default to AU for any other country
  return labelMap[countryCode] || 'Service Agreement (AU)';
};

const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
  return urlPattern.test(url);
};

const ClientAdminSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const emailParam = searchParams.get('email') || '';
  const returnUrl = searchParams.get('returnUrl') || '/account';
  const intent = searchParams.get('intent') || '';

  const [step, setStep] = useState<'email' | 'name' | 'details' | 'website' | 'business' | 'hiring' | 'review'>('email');
  const [noWebsite, setNoWebsite] = useState(false);
  const [selectedCompanySize, setSelectedCompanySize] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [originalSectionData, setOriginalSectionData] = useState<Record<string, unknown> | null>(null);
  const websiteInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    email: emailParam,
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    slug: '',
    industry: '',
    companySize: '',
    country: '',
    mobileCountryCode: 'AU',
    mobileNumber: '',
    phoneCountryCode: 'AU',
    phoneNumber: '',
    website: '',
    businessDescription: '',
    rolesNeeded: '',
    howCanWeHelp: '',
    termsAccepted: false,
  });

  const hasBusinessData = formData.businessDescription.trim() !== '' || 
                          formData.industry !== '' || 
                          formData.companySize !== '';

  const hasHiringData = selectedRoles.length > 0 || formData.howCanWeHelp.trim() !== '';

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      rolesNeeded: selectedRoles.join(', '),
    }));
  }, [selectedRoles]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingWebsite, setIsAnalyzingWebsite] = useState(false);
  const [websiteAnalysisStatus, setWebsiteAnalysisStatus] = useState<'idle' | 'analyzing' | 'completed' | 'failed'>('idle');
  const userTypedDescriptionRef = useRef(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [pendingAtsRetry, setPendingAtsRetry] = useState<SignupResponse | null>(null);
  const slugManuallyEditedRef = useRef(false);
  const [emailExists, setEmailExists] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [lastCheckedEmail, setLastCheckedEmail] = useState('');
  const latestEmailRef = useRef(formData.email);
  
  // Keep ref in sync with email changes
  latestEmailRef.current = formData.email.toLowerCase().trim();

  const checkEmailExists = useCallback(async (email: string) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailExists(false);
      setEmailChecked(false);
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    setIsCheckingEmail(true);
    try {
      const response = await fetch('/api/v1/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await response.json();
      // Only update state if this response matches the CURRENT email (use ref for latest value)
      if (normalizedEmail === latestEmailRef.current) {
        // valid === true means email exists in database (user already registered)
        // valid === false means email is available for signup
        setEmailExists(data.valid === true);
        setEmailChecked(true);
        setLastCheckedEmail(normalizedEmail);
      }
    } catch (error) {
      console.error('Error checking email:', error);
      // Only update error state if email still matches
      if (normalizedEmail === latestEmailRef.current) {
        setEmailExists(false);
        setEmailChecked(false);
      }
    } finally {
      setIsCheckingEmail(false);
    }
  }, []);

  const handleEmailBlur = () => {
    // Validate email format first
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid email address.' }));
      return;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid email address.' }));
      return;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    // Check if email exists
    checkEmailExists(formData.email);
  };

  const handleLoginRedirect = () => {
    const loginParams = new URLSearchParams();
    loginParams.set('email', formData.email);
    if (returnUrl !== '/account') {
      loginParams.set('returnUrl', returnUrl);
    }
    navigate(`/login?${loginParams.toString()}`);
  };

  const handleUseDifferentEmail = () => {
    setFormData(prev => ({ ...prev, email: '' }));
    setEmailExists(false);
    setEmailChecked(false);
    setErrors(prev => ({ ...prev, email: '' }));
  };

  const [aiAnalysisError, setAiAnalysisError] = useState(false);

  const handleAnalyzeWebsite = useCallback(async () => {
    if (!isValidUrl(formData.website) || isAnalyzingWebsite) return;
    
    setIsAnalyzingWebsite(true);
    setWebsiteAnalysisStatus('analyzing');
    setAiAnalysisError(false);
    try {
      let normalizedUrl = formData.website.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      const result = await analyzeWebsite(normalizedUrl);
      if (result.success && result.businessDescription) {
        // Only set description if user hasn't manually typed anything
        if (!userTypedDescriptionRef.current) {
          setFormData(prev => ({
            ...prev,
            businessDescription: result.businessDescription || '',
          }));
        }
        setWebsiteAnalysisStatus('completed');
      } else {
        setAiAnalysisError(true);
        setWebsiteAnalysisStatus('failed');
      }
    } catch (error) {
      console.error('Website analysis failed:', error);
      setAiAnalysisError(true);
      setWebsiteAnalysisStatus('failed');
    } finally {
      setIsAnalyzingWebsite(false);
    }
  }, [formData.website, isAnalyzingWebsite]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (field === 'email') {
      setEmailExists(false);
      setEmailChecked(false);
      setLastCheckedEmail('');
    }

    if (field === 'slug') {
      slugManuallyEditedRef.current = true;
    }

    // Track if user has manually typed in business description
    if (field === 'businessDescription' && typeof value === 'string' && value.trim()) {
      userTypedDescriptionRef.current = true;
    }

    if (field === 'companyName' && !slugManuallyEditedRef.current && typeof value === 'string') {
      const slugValue = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100);
      setFormData(prev => ({ ...prev, [field]: value, slug: slugValue }));
    }
  };

  // Field-level blur validation handlers
  const validateEmailField = () => {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid email address.' }));
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid email address.' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const validatePasswordField = () => {
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: 'Password is required.' }));
      return false;
    } else if (!isPasswordValid(formData.password)) {
      setErrors(prev => ({ ...prev, password: 'Password does not meet requirements.' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const validateConfirmPasswordField = () => {
    if (!formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password.' }));
      return false;
    } else if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      return false;
    }
    setErrors(prev => ({ ...prev, confirmPassword: '' }));
    return true;
  };

  // Check if email step is valid (for button disabled state)
  const isEmailStepValid = () => {
    const emailValid = formData.email && /\S+@\S+\.\S+/.test(formData.email);
    const passwordValid = formData.password && isPasswordValid(formData.password);
    const confirmPasswordValid = formData.confirmPassword && formData.password === formData.confirmPassword;
    return emailValid && passwordValid && confirmPasswordValid && !emailExists && !isCheckingEmail;
  };

  // Mobile number validation using libphonenumber-js
  const validateMobileNumber = (phoneNumber: string, countryCode: string): boolean => {
    if (!phoneNumber) {
      setErrors(prev => ({ ...prev, mobileNumber: 'Mobile number is required.' }));
      return false;
    }

    // Check for digits only
    if (!/^\d+$/.test(phoneNumber)) {
      setErrors(prev => ({ ...prev, mobileNumber: 'Mobile number must contain digits only.' }));
      return false;
    }

    // Validate using libphonenumber-js - pass national number with country code
    try {
      const country = countries.find(c => c.code === countryCode);
      // isValidPhoneNumber expects national number when country is provided
      const isValid = isValidPhoneNumber(phoneNumber, countryCode as any);
      
      if (!isValid) {
        const countryName = country?.name || countryCode;
        setErrors(prev => ({ ...prev, mobileNumber: `Enter a valid mobile number for ${countryName}.` }));
        return false;
      }
    } catch {
      // Fallback: basic length validation if libphonenumber fails
      if (phoneNumber.length < 6 || phoneNumber.length > 15) {
        setErrors(prev => ({ ...prev, mobileNumber: 'Enter a valid mobile number.' }));
        return false;
      }
    }

    setErrors(prev => ({ ...prev, mobileNumber: '' }));
    return true;
  };

  // Phone number validation (optional field) using libphonenumber-js
  const validatePhoneNumber = (phoneNumber: string, countryCode: string): boolean => {
    // Phone is optional, so empty is valid
    if (!phoneNumber) {
      setErrors(prev => ({ ...prev, phoneNumber: '' }));
      return true;
    }

    // Check for digits only
    if (!/^\d+$/.test(phoneNumber)) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Phone number must contain digits only.' }));
      return false;
    }

    // Validate using libphonenumber-js - pass national number with country code
    try {
      const country = countries.find(c => c.code === countryCode);
      // isValidPhoneNumber expects national number when country is provided
      const isValid = isValidPhoneNumber(phoneNumber, countryCode as any);
      
      if (!isValid) {
        const countryName = country?.name || countryCode;
        setErrors(prev => ({ ...prev, phoneNumber: `Enter a valid phone number for ${countryName}.` }));
        return false;
      }
    } catch {
      // Fallback: basic length validation if libphonenumber fails
      if (phoneNumber.length < 6 || phoneNumber.length > 15) {
        setErrors(prev => ({ ...prev, phoneNumber: 'Enter a valid phone number.' }));
        return false;
      }
    }

    setErrors(prev => ({ ...prev, phoneNumber: '' }));
    return true;
  };

  // Check if name step is valid (for button disabled state)
  const isNameStepValid = () => {
    const firstNameValid = formData.firstName && formData.firstName.length <= 50;
    const lastNameValid = formData.lastName && formData.lastName.length <= 50;
    const mobileValid = formData.mobileNumber && validateMobileNumberSilent(formData.mobileNumber, formData.mobileCountryCode);
    return firstNameValid && lastNameValid && mobileValid;
  };

  // Silent validation (doesn't set errors)
  const validateMobileNumberSilent = (phoneNumber: string, countryCode: string): boolean => {
    if (!phoneNumber || !/^\d+$/.test(phoneNumber)) return false;
    try {
      // isValidPhoneNumber expects national number when country is provided
      return isValidPhoneNumber(phoneNumber, countryCode as any);
    } catch {
      return phoneNumber.length >= 6 && phoneNumber.length <= 15;
    }
  };

  const validateEmailStep = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Enter a valid email address.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (!isPasswordValid(formData.password)) {
      newErrors.password = 'Password does not meet requirements.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNameStep = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'First name must not exceed 50 characters';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Last name must not exceed 50 characters';
    }

    // Mobile number validation
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!/^\d+$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must contain digits only.';
    } else {
      try {
        const country = countries.find(c => c.code === formData.mobileCountryCode);
        // isValidPhoneNumber expects national number when country is provided
        const isValid = isValidPhoneNumber(formData.mobileNumber, formData.mobileCountryCode as any);
        if (!isValid) {
          const countryName = country?.name || formData.mobileCountryCode;
          newErrors.mobileNumber = `Enter a valid mobile number for ${countryName}.`;
        }
      } catch {
        if (formData.mobileNumber.length < 6 || formData.mobileNumber.length > 15) {
          newErrors.mobileNumber = 'Enter a valid mobile number.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDetailsStep = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.companyName) {
      newErrors.companyName = 'Company name is required';
    } else if (formData.companyName.length > 255) {
      newErrors.companyName = 'Company name must not exceed 255 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateWebsiteStep = () => {
    const newErrors: { [key: string]: string } = {};

    if (!noWebsite && !formData.website) {
      newErrors.website = 'Website URL is required.';
    } else if (!noWebsite && formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (e.g., https://company.com).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Run form validation first to show errors to user
    if (!validateEmailStep()) {
      return;
    }
    
    // Compute if the email check is valid for current input
    const normalizedCurrentEmail = formData.email.toLowerCase().trim();
    const emailCheckIsValid = emailChecked && lastCheckedEmail === normalizedCurrentEmail;
    
    // Don't proceed if email check is in progress
    if (isCheckingEmail) {
      return;
    }
    
    // If email check is valid and email exists, block progression
    if (emailCheckIsValid && emailExists) {
      return;
    }
    
    // If email hasn't been checked for current input, trigger check
    if (!emailCheckIsValid && formData.email && /\S+@\S+\.\S+/.test(formData.email)) {
      checkEmailExists(formData.email);
      return;
    }
    
    setStep('name');
  };

  const handleNameContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateNameStep()) {
      if (editMode) {
        setEditMode(false);
        setEditSection(null);
        setStep('review');
      } else {
        setStep('details');
      }
    }
  };

  const handleDetailsContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDetailsStep()) {
      if (editMode) {
        setEditMode(false);
        setEditSection(null);
        setStep('review');
      } else {
        setStep('website');
      }
    }
  };

  const handleWebsiteContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateWebsiteStep()) {
      setStep('business');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsLoading(true);
    setErrors({});

    try {
      const mobileDialCode = countries.find(c => c.code === formData.mobileCountryCode)?.dialCode || '';
      const phoneDialCode = countries.find(c => c.code === formData.phoneCountryCode)?.dialCode || '';

      const response = await clientAdminSignup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName,
        slug: formData.slug || undefined,
        industry: formData.industry || undefined,
        companySize: formData.companySize || undefined,
        country: formData.country || undefined,
        mobileCountryCode: formData.mobileCountryCode || undefined,
        mobileNumber: formData.mobileNumber ? `${mobileDialCode}${formData.mobileNumber.replace(/\s/g, '')}` : undefined,
        phoneCountryCode: formData.phoneCountryCode || undefined,
        phoneNumber: formData.phoneNumber ? `${phoneDialCode}${formData.phoneNumber.replace(/\s/g, '')}` : undefined,
        website: formData.website || undefined,
        businessDescription: formData.businessDescription || undefined,
        rolesNeeded: formData.rolesNeeded || undefined,
        howCanWeHelp: formData.howCanWeHelp || undefined,
        termsAccepted: formData.termsAccepted,
      });

      console.log('Client admin signup response:', response);

      if (response.atsProvisioningSuccess && response.atsRedirectUrl) {
        console.log('Redirecting to ATS portal:', response.atsRedirectUrl);
        window.location.href = response.atsRedirectUrl;
      } else {
        setPendingAtsRetry(response);
        setErrors({
          atsError: "We couldn't connect you to the ATS portal right now. Please try again in a moment.",
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Client admin signup error:', error?.message || error);
      const errorMessage = error?.message || 'Failed to create account. Please try again.';
      setErrors({
        general: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const handleRetryAtsProvisioning = async () => {
    if (!pendingAtsRetry?.userId || !pendingAtsRetry?.organizationId || !pendingAtsRetry?.organizationSlug) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await retryAtsProvisioning(
        pendingAtsRetry.userId,
        pendingAtsRetry.organizationId,
        pendingAtsRetry.organizationSlug,
      );

      if (response.success && response.atsRedirectUrl) {
        window.location.href = response.atsRedirectUrl;
      } else {
        setErrors({
          atsError: "We couldn't connect you to the ATS portal right now. Please try again in a moment.",
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('ATS retry error:', error);
      setErrors({
        atsError: "We couldn't connect you to the ATS portal right now. Please try again in a moment.",
      });
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (editMode) {
      setEditMode(false);
      setEditSection(null);
      setStep('review');
      return;
    }
    if (step === 'review') {
      setStep('hiring');
      return;
    }
    if (step === 'hiring') {
      setStep('business');
      return;
    }
    if (step === 'business') {
      setStep('website');
      return;
    }
    if (step === 'website') {
      setStep('details');
      return;
    }
    if (step === 'details') {
      setStep('name');
      return;
    }
    if (step === 'name') {
      setStep('email');
      return;
    }
    
    if (intent === 'candidate' || intent === 'client') {
      const loginParams = new URLSearchParams();
      if (returnUrl !== '/account') {
        loginParams.set('returnUrl', returnUrl);
      }
      navigate(`/login${loginParams.toString() ? `?${loginParams.toString()}` : ''}`);
    } else {
      navigate(`/signup-select?email=${encodeURIComponent(formData.email)}${returnUrl !== '/account' ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`);
    }
  };

  const handleCompanySizeSelect = (size: string) => {
    setSelectedCompanySize(size);
    handleInputChange('companySize', size);
  };

  const handleBusinessContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode) {
      setEditMode(false);
      setEditSection(null);
      setStep('review');
    } else {
      setStep('hiring');
    }
  };

  const handleHiringContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode) {
      setEditMode(false);
      setEditSection(null);
      setStep('review');
    } else {
      setStep('review');
    }
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const extractSectionSnapshot = (section: string): Record<string, unknown> => {
    switch (section) {
      case 'contact':
        return {
          firstName: formData.firstName,
          lastName: formData.lastName,
          mobileCountryCode: formData.mobileCountryCode,
          mobileNumber: formData.mobileNumber,
          phoneCountryCode: formData.phoneCountryCode,
          phoneNumber: formData.phoneNumber,
        };
      case 'company':
        return {
          companyName: formData.companyName,
          country: formData.country,
        };
      case 'business':
        return {
          businessDescription: formData.businessDescription,
          industry: formData.industry,
          companySize: selectedCompanySize,
        };
      case 'hiring':
        return {
          selectedRoles: [...selectedRoles],
          howCanWeHelp: formData.howCanWeHelp,
        };
      default:
        return {};
    }
  };

  const arraysEqual = (a: string[], b: string[]): boolean => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  const hasSectionChanged = (): boolean => {
    if (!originalSectionData || !editSection) return false;
    const current = extractSectionSnapshot(editSection);
    
    for (const key of Object.keys(originalSectionData)) {
      const origVal = originalSectionData[key];
      const currVal = current[key];
      
      if (Array.isArray(origVal) && Array.isArray(currVal)) {
        if (!arraysEqual(origVal as string[], currVal as string[])) return true;
      } else if (origVal !== currVal) {
        return true;
      }
    }
    return false;
  };

  const handleEditSection = (section: string) => {
    const snapshot = extractSectionSnapshot(section);
    setOriginalSectionData(snapshot);
    setEditMode(true);
    setEditSection(section);
    switch (section) {
      case 'contact':
        setStep('name');
        break;
      case 'company':
        setStep('details');
        break;
      case 'business':
        setStep('business');
        break;
      case 'hiring':
        setStep('hiring');
        break;
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditSection(null);
    setOriginalSectionData(null);
    setStep('review');
  };

  const handleUpdateSection = (e: React.FormEvent) => {
    e.preventDefault();
    setEditMode(false);
    setEditSection(null);
    setOriginalSectionData(null);
    setStep('review');
  };

  const handleNoWebsiteToggle = () => {
    setNoWebsite(true);
    handleInputChange('website', '');
  };

  const handleHaveWebsiteToggle = () => {
    setNoWebsite(false);
    setTimeout(() => {
      websiteInputRef.current?.focus();
    }, 100);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F5F7F8',
      }}
    >
      {/* Header with Teamified Logo */}
      <Box
        sx={{
          width: '100%',
          py: 2,
          px: 4,
          bgcolor: 'white',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#1a1a1a',
            letterSpacing: '-0.02em',
          }}
        >
          teamified
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
      <Container maxWidth="md">
        <Fade in key={step} timeout={400}>
          <Paper
            elevation={24}
            sx={{
              padding: { xs: 3, sm: 4, md: 5 },
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              overflow: 'hidden',
            }}
          >
            {/* Step 1: Email */}
            {step === 'email' && (
              <Box component="form" onSubmit={handleEmailContinue} noValidate>
                <Box mb={4}>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#1a1a1a',
                    }}
                  >
                    Welcome to Teamified
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    Let's get started with your email
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

                <Box sx={{ mb: 2 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    Email address
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={handleEmailBlur}
                    error={!!errors.email || emailExists}
                    helperText={errors.email}
                    autoFocus
                    disabled={isLoading || isCheckingEmail}
                    InputProps={{
                      endAdornment: isCheckingEmail ? (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: '#E5E7EB',
                        },
                        '&:hover fieldset': {
                          borderColor: '#9333EA',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#9333EA',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Box>

                {/* Email Exists Inline Error */}
                {emailExists && (
                  <Typography
                    sx={{
                      color: '#d32f2f',
                      fontSize: '0.75rem',
                      mt: 0.5,
                      mb: 1,
                      ml: 1.75,
                    }}
                  >
                    Account exists. Are you trying to{' '}
                    <Box
                      component="a"
                      href="/login"
                      onClick={handleLoginRedirect}
                      sx={{
                        color: '#9333EA',
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      login
                    </Box>
                    ?
                  </Typography>
                )}

                {/* Only show remaining fields if email doesn't exist - keep visible during check but disabled */}
                {!emailExists && (
                  <>
                {/* Password Field */}
                <Box sx={{ mb: 2 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={validatePasswordField}
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={isLoading || isCheckingEmail}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#9CA3AF' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: '#E5E7EB',
                        },
                        '&:hover fieldset': {
                          borderColor: '#9333EA',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#9333EA',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Box>

                {/* Password Requirements - hide when password is valid */}
                {!isPasswordValid(formData.password) && (
                  <PasswordRequirements password={formData.password} />
                )}

                {/* Confirm Password Field */}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    Confirm Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={validateConfirmPasswordField}
                    error={!!errors.confirmPassword}
                    helperText={
                      errors.confirmPassword 
                        ? errors.confirmPassword 
                        : (formData.confirmPassword && formData.password === formData.confirmPassword 
                            ? 'Passwords match.' 
                            : '')
                    }
                    FormHelperTextProps={{
                      sx: {
                        color: (!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword) 
                          ? '#10B981' 
                          : undefined
                      }
                    }}
                    disabled={isLoading || isCheckingEmail}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: '#9CA3AF' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: '#E5E7EB',
                        },
                        '&:hover fieldset': {
                          borderColor: '#9333EA',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#9333EA',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Box>
                  </>
                )}

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={isLoading}
                    startIcon={<ArrowBack />}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderColor: '#9333EA',
                      color: '#9333EA',
                      '&:hover': {
                        borderColor: '#7E22CE',
                        bgcolor: 'rgba(147, 51, 234, 0.04)',
                      },
                    }}
                  >
                    Back
                  </Button>
                  {!emailExists && !isCheckingEmail && (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading || !isEmailStepValid()}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      bgcolor: '#9333EA',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#A855F7',
                      },
                      '&:active': {
                        bgcolor: '#7E22CE',
                      },
                      '&:disabled': {
                        bgcolor: 'rgba(147, 51, 234, 0.5)',
                        color: 'white',
                      },
                    }}
                  >
                    Next
                  </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 2: Name & Contact */}
            {step === 'name' && (
              <Box component="form" onSubmit={handleNameContinue} noValidate>
                <Box mb={4}>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#1a1a1a',
                    }}
                  >
                    What's your name?
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    We'd love to know who we're working with
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                  <Box>
                    <Typography
                      component="label"
                      sx={{
                        display: 'block',
                        mb: 1,
                        fontWeight: 500,
                        color: '#1a1a1a',
                        fontSize: '0.875rem',
                      }}
                    >
                      First Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'white',
                          borderRadius: 2,
                          '& fieldset': { borderColor: '#E5E7EB' },
                          '&:hover fieldset': { borderColor: '#9333EA' },
                          '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
                        },
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      component="label"
                      sx={{
                        display: 'block',
                        mb: 1,
                        fontWeight: 500,
                        color: '#1a1a1a',
                        fontSize: '0.875rem',
                      }}
                    >
                      Last Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'white',
                          borderRadius: 2,
                          '& fieldset': { borderColor: '#E5E7EB' },
                          '&:hover fieldset': { borderColor: '#9333EA' },
                          '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    Mobile Number
                  </Typography>
                  <PhoneInput
                    countryCode={formData.mobileCountryCode}
                    phoneNumber={formData.mobileNumber}
                    onCountryChange={(value) => {
                      handleInputChange('mobileCountryCode', value);
                      if (formData.mobileNumber) {
                        validateMobileNumber(formData.mobileNumber, value);
                      }
                    }}
                    onPhoneChange={(value) => handleInputChange('mobileNumber', value)}
                    onBlur={() => validateMobileNumber(formData.mobileNumber, formData.mobileCountryCode)}
                    label=""
                    error={!!errors.mobileNumber}
                    helperText={errors.mobileNumber}
                    disabled={isLoading}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    Phone Number{' '}
                    <Typography component="span" sx={{ color: '#9CA3AF', fontWeight: 400 }}>
                      (optional)
                    </Typography>
                  </Typography>
                  <PhoneInput
                    countryCode={formData.phoneCountryCode}
                    phoneNumber={formData.phoneNumber}
                    onCountryChange={(value) => {
                      handleInputChange('phoneCountryCode', value);
                      if (formData.phoneNumber) {
                        validatePhoneNumber(formData.phoneNumber, value);
                      }
                    }}
                    onPhoneChange={(value) => handleInputChange('phoneNumber', value)}
                    onBlur={() => validatePhoneNumber(formData.phoneNumber, formData.phoneCountryCode)}
                    label=""
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                    disabled={isLoading}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  {!editMode && (
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      disabled={isLoading}
                      startIcon={<ArrowBack />}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderColor: '#9333EA',
                        color: '#9333EA',
                        '&:hover': {
                          borderColor: '#7E22CE',
                          bgcolor: 'rgba(147, 51, 234, 0.04)',
                        },
                      }}
                    >
                      Back
                    </Button>
                  )}
                  {editMode && !hasSectionChanged() ? (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      startIcon={<ArrowBack />}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderColor: '#9333EA',
                        color: '#9333EA',
                        '&:hover': {
                          borderColor: '#7E22CE',
                          bgcolor: 'rgba(147, 51, 234, 0.04)',
                        },
                      }}
                    >
                      Back to Review
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading || !isNameStepValid()}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        bgcolor: '#9333EA',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#A855F7',
                        },
                        '&:active': {
                          bgcolor: '#7E22CE',
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(147, 51, 234, 0.5)',
                          color: 'white',
                        },
                      }}
                    >
                      {editMode ? 'Update' : 'Next'}
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 3: Company Details */}
            {step === 'details' && (
              <Box component="form" onSubmit={handleDetailsContinue} noValidate>
                <Box mb={4}>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#1a1a1a',
                    }}
                  >
                    Your company details?
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    Tell us about your organization
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    Company Name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Your company name"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    error={!!errors.companyName}
                    helperText={errors.companyName}
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        borderRadius: 2,
                        '& fieldset': { borderColor: '#E5E7EB' },
                        '&:hover fieldset': { borderColor: '#9333EA' },
                        '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    Country
                  </Typography>
                  <CountrySelect
                    value={formData.country}
                    onChange={(value) => handleInputChange('country', value)}
                    disabled={isLoading}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  {!editMode && (
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      disabled={isLoading}
                      startIcon={<ArrowBack />}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderColor: '#9333EA',
                        color: '#9333EA',
                        '&:hover': {
                          borderColor: '#7E22CE',
                          bgcolor: 'rgba(147, 51, 234, 0.04)',
                        },
                      }}
                    >
                      Back
                    </Button>
                  )}
                  {editMode && !hasSectionChanged() ? (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      startIcon={<ArrowBack />}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderColor: '#9333EA',
                        color: '#9333EA',
                        '&:hover': {
                          borderColor: '#7E22CE',
                          bgcolor: 'rgba(147, 51, 234, 0.04)',
                        },
                      }}
                    >
                      Back to Review
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        bgcolor: '#9333EA',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#A855F7',
                        },
                        '&:active': {
                          bgcolor: '#7E22CE',
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(147, 51, 234, 0.5)',
                          color: 'white',
                        },
                      }}
                    >
                      {editMode ? 'Update' : 'Next'}
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 4: Website */}
            {step === 'website' && (
              <Box component="form" onSubmit={handleWebsiteContinue} noValidate>
                <Box mb={4}>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#1a1a1a',
                    }}
                  >
                    Welcome to Teamified, {formData.firstName}!
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    We'll use AI to understand your business and create a tailored job description
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

                {!noWebsite ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        component="label"
                        sx={{
                          display: 'block',
                          mb: 1,
                          fontWeight: 500,
                          color: '#1a1a1a',
                          fontSize: '0.875rem',
                        }}
                      >
                        Website URL
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="www.example.com"
                        value={formData.website}
                        onChange={(e) => {
                          handleInputChange('website', e.target.value);
                          // Reset analysis status when URL changes
                          if (websiteAnalysisStatus !== 'idle') {
                            setWebsiteAnalysisStatus('idle');
                          }
                        }}
                        onBlur={() => {
                          if (isValidUrl(formData.website) && websiteAnalysisStatus === 'idle') {
                            handleAnalyzeWebsite();
                          }
                        }}
                        error={!!errors.website}
                        helperText={errors.website}
                        disabled={isLoading || isAnalyzingWebsite}
                        inputRef={websiteInputRef}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                            borderRadius: 2,
                            '& fieldset': { borderColor: '#E5E7EB' },
                            '&:hover fieldset': { borderColor: '#9333EA' },
                            '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
                          },
                        }}
                      />
                      {websiteAnalysisStatus === 'failed' && (
                        <Typography sx={{ color: '#EF4444', fontSize: '0.75rem', mt: 0.5 }}>
                          We couldn't fetch your website. You can still continue and enter your business description manually.{' '}
                          <Link
                            component="button"
                            type="button"
                            onClick={() => {
                              setWebsiteAnalysisStatus('idle');
                              handleAnalyzeWebsite();
                            }}
                            sx={{
                              color: '#9333EA',
                              textDecoration: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            Try again
                          </Link>
                        </Typography>
                      )}
                    </Box>

                    {/* Analysis Status Feedback */}
                    {websiteAnalysisStatus === 'analyzing' && (
                      <Box sx={{ 
                        mb: 3, 
                        p: 2, 
                        bgcolor: '#F5F3FF', 
                        borderRadius: 2, 
                        border: '1px solid #9333EA',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <CircularProgress size={20} sx={{ color: '#9333EA' }} />
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: '#9333EA', fontSize: '0.875rem' }}>
                            Analyzing your website...
                          </Typography>
                          <Typography sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                            We're using AI to understand your business and generate a description
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {websiteAnalysisStatus === 'completed' && (
                      <Box sx={{ 
                        mb: 3, 
                        p: 2, 
                        bgcolor: '#F0FDF4', 
                        borderRadius: 2, 
                        border: '1px solid #10B981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <Box sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          bgcolor: '#10B981', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <Typography sx={{ color: 'white', fontSize: '0.875rem', fontWeight: 600 }}>✓</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 600, color: '#10B981', fontSize: '0.875rem' }}>
                          Website analyzed successfully! Click Next to continue.
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mb: 3 }}>
                      <Link
                        component="button"
                        type="button"
                        onClick={handleNoWebsiteToggle}
                        disabled={isAnalyzingWebsite}
                        sx={{
                          color: isAnalyzingWebsite ? '#9CA3AF' : '#9333EA',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          cursor: isAnalyzingWebsite ? 'not-allowed' : 'pointer',
                          '&:hover': {
                            textDecoration: isAnalyzingWebsite ? 'none' : 'underline',
                          },
                        }}
                      >
                        I don't have a website
                      </Link>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ mb: 3, p: 3, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                    <Typography sx={{ color: '#6b7280', mb: 2 }}>
                      No problem! We'll help you create a great job description without it.
                    </Typography>
                    <Link
                      component="button"
                      type="button"
                      onClick={handleHaveWebsiteToggle}
                      sx={{
                        color: '#9333EA',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Actually, I have website
                    </Link>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={isLoading || isAnalyzingWebsite}
                    startIcon={<ArrowBack />}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderColor: '#9333EA',
                      color: '#9333EA',
                      '&:hover': {
                        borderColor: '#7E22CE',
                        bgcolor: 'rgba(147, 51, 234, 0.04)',
                      },
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading || (!noWebsite && isValidUrl(formData.website) && isAnalyzingWebsite)}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      bgcolor: '#9333EA',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#A855F7',
                      },
                      '&:active': {
                        bgcolor: '#7E22CE',
                      },
                      '&:disabled': {
                        bgcolor: 'rgba(147, 51, 234, 0.5)',
                        color: 'white',
                      },
                    }}
                  >
                    {isAnalyzingWebsite ? 'Analyzing...' : 'Next'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 5: Business Information */}
            {step === 'business' && (
              <Box component="form" onSubmit={handleBusinessContinue} noValidate>
                <Box mb={4}>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#1a1a1a',
                    }}
                  >
                    Tell us about your business
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    This helps us match you with the right candidates
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    Business Description
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Tell us what your company does..."
                    value={formData.businessDescription}
                    onChange={(e) => {
                      handleInputChange('businessDescription', e.target.value);
                      setAiAnalysisError(false);
                    }}
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        borderRadius: 2,
                        '& fieldset': { borderColor: '#E5E7EB' },
                        '&:hover fieldset': { borderColor: '#9333EA' },
                        '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
                      },
                    }}
                  />
                  {formData.businessDescription && !userTypedDescriptionRef.current && formData.website && isValidUrl(formData.website) && (
                    <Typography variant="caption" sx={{ color: '#10B981', mt: 0.5, display: 'block' }}>
                      AI-generated from your website. Feel free to edit.
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    Industry
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    disabled={isLoading}
                    SelectProps={{
                      displayEmpty: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        borderRadius: 2,
                        '& fieldset': { borderColor: '#E5E7EB' },
                        '&:hover fieldset': { borderColor: '#9333EA' },
                        '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
                      },
                    }}
                  >
                    <MenuItem value="" disabled>
                      <Typography sx={{ color: '#9CA3AF' }}>Select your industry</Typography>
                    </MenuItem>
                    {INDUSTRIES.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block' }}>
                    Select the industry your company operates in
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1.5,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    Company Size
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                    {COMPANY_SIZES.map((size) => (
                      <Box
                        key={size}
                        onClick={() => !isLoading && handleCompanySizeSelect(size)}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: selectedCompanySize === size ? '#9333EA' : '#E5E7EB',
                          borderRadius: 2,
                          cursor: isLoading ? 'default' : 'pointer',
                          bgcolor: selectedCompanySize === size ? 'rgba(147, 51, 234, 0.04)' : 'white',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: isLoading ? undefined : '#9333EA',
                            bgcolor: isLoading ? undefined : 'rgba(147, 51, 234, 0.02)',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: selectedCompanySize === size ? 600 : 400,
                            color: selectedCompanySize === size ? '#9333EA' : '#1a1a1a',
                            fontSize: '0.875rem',
                          }}
                        >
                          {size}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  {!editMode && (
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      disabled={isLoading}
                      startIcon={<ArrowBack />}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderColor: '#9333EA',
                        color: '#9333EA',
                        '&:hover': {
                          borderColor: '#7E22CE',
                          bgcolor: 'rgba(147, 51, 234, 0.04)',
                        },
                      }}
                    >
                      Back
                    </Button>
                  )}
                  {editMode && !hasSectionChanged() ? (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      startIcon={<ArrowBack />}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderColor: '#9333EA',
                        color: '#9333EA',
                        '&:hover': {
                          borderColor: '#7E22CE',
                          bgcolor: 'rgba(147, 51, 234, 0.04)',
                        },
                      }}
                    >
                      Back to Review
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        bgcolor: '#9333EA',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#A855F7',
                        },
                        '&:active': {
                          bgcolor: '#7E22CE',
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(147, 51, 234, 0.5)',
                          color: 'white',
                        },
                      }}
                    >
                      {isLoading ? <CircularProgress size={24} color="inherit" /> : editMode ? 'Update' : hasBusinessData ? 'Next' : 'Skip'}
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 6: What are you looking for? */}
            {step === 'hiring' && (
              <Box component="form" onSubmit={handleHiringContinue} noValidate>
                <Box mb={4}>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#1a1a1a',
                    }}
                  >
                    What are you looking for?
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    Help us understand your hiring needs
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1.5,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    What role/s do you need?
                  </Typography>
                  <RolesMultiSelect
                    selectedRoles={selectedRoles}
                    onChange={setSelectedRoles}
                    disabled={isLoading}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      mb: 1,
                      fontWeight: 500,
                      color: '#1a1a1a',
                      fontSize: '0.875rem',
                    }}
                  >
                    How can we help you?
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Tell us about your hiring goals, timeline, or any specific requirements..."
                    value={formData.howCanWeHelp}
                    onChange={(e) => handleInputChange('howCanWeHelp', e.target.value)}
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        borderRadius: 2,
                        '& fieldset': { borderColor: '#E5E7EB' },
                        '&:hover fieldset': { borderColor: '#9333EA' },
                        '&.Mui-focused fieldset': { borderColor: '#9333EA', borderWidth: 2 },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  {!editMode && (
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      disabled={isLoading}
                      startIcon={<ArrowBack />}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderColor: '#9333EA',
                        color: '#9333EA',
                        '&:hover': {
                          borderColor: '#7E22CE',
                          bgcolor: 'rgba(147, 51, 234, 0.04)',
                        },
                      }}
                    >
                      Back
                    </Button>
                  )}
                  {editMode && !hasSectionChanged() ? (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      startIcon={<ArrowBack />}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderColor: '#9333EA',
                        color: '#9333EA',
                        '&:hover': {
                          borderColor: '#7E22CE',
                          bgcolor: 'rgba(147, 51, 234, 0.04)',
                        },
                      }}
                    >
                      Back to Review
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        bgcolor: '#9333EA',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#A855F7',
                        },
                        '&:active': {
                          bgcolor: '#7E22CE',
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(147, 51, 234, 0.5)',
                          color: 'white',
                        },
                      }}
                    >
                      {isLoading ? <CircularProgress size={24} color="inherit" /> : editMode ? 'Update' : hasHiringData ? 'Next' : 'Skip'}
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 7: Review Your Information */}
            {step === 'review' && (
              <Box>
                <Box mb={4}>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#1a1a1a',
                    }}
                  >
                    Review Your Information
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    Please confirm your details and accept our terms
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

                {errors.atsError && (
                  <Alert 
                    severity="warning" 
                    sx={{ mb: 3 }}
                    action={
                      <Button 
                        color="inherit" 
                        size="small"
                        onClick={handleRetryAtsProvisioning}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Retrying...' : 'Try Again'}
                      </Button>
                    }
                  >
                    {errors.atsError}
                  </Alert>
                )}

                <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                  <Box sx={{ mb: 2, p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>Contact Details</Typography>
                      <Link
                        component="button"
                        type="button"
                        onClick={() => handleEditSection('contact')}
                        sx={{ color: '#9333EA', fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        Edit
                      </Link>
                    </Box>
                    <Box sx={{ display: 'grid', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Name</Typography>
                        <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{formData.firstName} {formData.lastName}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Email</Typography>
                        <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{formData.email}</Typography>
                      </Box>
                      {formData.mobileNumber && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Mobile</Typography>
                          <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>
                            {countries.find(c => c.code === formData.mobileCountryCode)?.dialCode} {formData.mobileNumber}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2, p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>Company Details</Typography>
                      <Link
                        component="button"
                        type="button"
                        onClick={() => handleEditSection('company')}
                        sx={{ color: '#9333EA', fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        Edit
                      </Link>
                    </Box>
                    <Box sx={{ display: 'grid', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Company</Typography>
                        <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{formData.companyName || 'Not provided'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Country</Typography>
                        <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>
                          {countries.find(c => c.code === formData.country)?.name || formData.country}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2, p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>Business Details</Typography>
                      <Link
                        component="button"
                        type="button"
                        onClick={() => handleEditSection('business')}
                        sx={{ color: '#9333EA', fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        Edit
                      </Link>
                    </Box>
                    <Box sx={{ display: 'grid', gap: 0.5 }}>
                      {formData.businessDescription && (
                        <Box>
                          <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Description</Typography>
                          <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem', mt: 0.5 }}>
                            {formData.businessDescription}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Industry</Typography>
                        <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{formData.industry || 'Not specified'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>Size</Typography>
                        <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>{formData.companySize || 'Not specified'}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2, p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>Hiring Needs</Typography>
                      <Link
                        component="button"
                        type="button"
                        onClick={() => handleEditSection('hiring')}
                        sx={{ color: '#9333EA', fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        Edit
                      </Link>
                    </Box>
                    {selectedRoles.length > 0 ? (
                      <Typography sx={{ color: '#1a1a1a', fontSize: '0.875rem' }}>
                        {selectedRoles.join(', ')}
                      </Typography>
                    ) : (
                      <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem', fontStyle: 'italic' }}>
                        No hiring needs specified
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mt: 3, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>Legal Agreement</Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.termsAccepted}
                        onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                        disabled={isLoading}
                        sx={{
                          color: '#D1D5DB',
                          '&.Mui-checked': {
                            color: '#9333EA',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: '0.875rem', color: '#1a1a1a' }}>
                        I accept the{' '}
                        <Link
                          href={getServiceAgreementUrl(formData.country)}
                          target="_blank"
                          sx={{ color: '#9333EA' }}
                        >
                          {getServiceAgreementLabel(formData.country)}
                        </Link>
                        ,{' '}
                        <Link href="https://teamified.com/terms" target="_blank" sx={{ color: '#9333EA' }}>
                          Terms
                        </Link>
                        , and{' '}
                        <Link href="https://teamified.com/privacy" target="_blank" sx={{ color: '#9333EA' }}>
                          Privacy Policy
                        </Link>
                      </Typography>
                    }
                  />
                  {errors.terms && (
                    <Typography sx={{ color: '#DC2626', fontSize: '0.75rem', mt: 1 }}>
                      {errors.terms}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={isLoading}
                    startIcon={<ArrowBack />}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderColor: '#9333EA',
                      color: '#9333EA',
                      '&:hover': {
                        borderColor: '#7E22CE',
                        bgcolor: 'rgba(147, 51, 234, 0.04)',
                      },
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.termsAccepted}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      bgcolor: '#9333EA',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#A855F7',
                      },
                      '&:active': {
                        bgcolor: '#7E22CE',
                      },
                      '&:disabled': {
                        bgcolor: 'rgba(147, 51, 234, 0.5)',
                        color: 'white',
                      },
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create My Account'}
                  </Button>
                </Box>
              </Box>
            )}

          </Paper>
        </Fade>
      </Container>
      </Box>
    </Box>
  );
};

export default ClientAdminSignupPage;
