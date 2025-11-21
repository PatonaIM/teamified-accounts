import { describe, it, expect } from 'vitest';
import {
  COUNTRY_STATUTORY_COMPONENTS,
  getStatutoryComponentsForCountry,
  isStatutoryComponentApplicable,
} from '../countryComponentMapping';
import { StatutoryComponentType } from '../../types/payroll/payroll.types';

describe('countryComponentMapping', () => {
  describe('COUNTRY_STATUTORY_COMPONENTS', () => {
    it('should have mappings for India', () => {
      expect(COUNTRY_STATUTORY_COMPONENTS['IN']).toBeDefined();
      expect(COUNTRY_STATUTORY_COMPONENTS['IN']).toHaveLength(4);
      expect(COUNTRY_STATUTORY_COMPONENTS['IN']).toContain(StatutoryComponentType.EPF);
      expect(COUNTRY_STATUTORY_COMPONENTS['IN']).toContain(StatutoryComponentType.ESI);
      expect(COUNTRY_STATUTORY_COMPONENTS['IN']).toContain(StatutoryComponentType.PT);
      expect(COUNTRY_STATUTORY_COMPONENTS['IN']).toContain(StatutoryComponentType.TDS);
    });

    it('should have mappings for Philippines', () => {
      expect(COUNTRY_STATUTORY_COMPONENTS['PH']).toBeDefined();
      expect(COUNTRY_STATUTORY_COMPONENTS['PH']).toHaveLength(3);
      expect(COUNTRY_STATUTORY_COMPONENTS['PH']).toContain(StatutoryComponentType.SSS);
      expect(COUNTRY_STATUTORY_COMPONENTS['PH']).toContain(StatutoryComponentType.PHILHEALTH);
      expect(COUNTRY_STATUTORY_COMPONENTS['PH']).toContain(StatutoryComponentType.PAGIBIG);
    });

    it('should have mappings for Australia', () => {
      expect(COUNTRY_STATUTORY_COMPONENTS['AU']).toBeDefined();
      expect(COUNTRY_STATUTORY_COMPONENTS['AU']).toHaveLength(1);
      expect(COUNTRY_STATUTORY_COMPONENTS['AU']).toContain(StatutoryComponentType.SUPERANNUATION);
    });

    it('should have mappings for Malaysia', () => {
      expect(COUNTRY_STATUTORY_COMPONENTS['MY']).toBeDefined();
      expect(COUNTRY_STATUTORY_COMPONENTS['MY']).toHaveLength(3);
      expect(COUNTRY_STATUTORY_COMPONENTS['MY']).toContain(StatutoryComponentType.EPF_MY);
      expect(COUNTRY_STATUTORY_COMPONENTS['MY']).toContain(StatutoryComponentType.SOCSO);
      expect(COUNTRY_STATUTORY_COMPONENTS['MY']).toContain(StatutoryComponentType.EIS);
    });

    it('should have mappings for Singapore', () => {
      expect(COUNTRY_STATUTORY_COMPONENTS['SG']).toBeDefined();
      expect(COUNTRY_STATUTORY_COMPONENTS['SG']).toHaveLength(1);
      expect(COUNTRY_STATUTORY_COMPONENTS['SG']).toContain(StatutoryComponentType.CPF);
    });

    it('should not contain cross-country component types', () => {
      // India should not have Philippines components
      expect(COUNTRY_STATUTORY_COMPONENTS['IN']).not.toContain(StatutoryComponentType.SSS);
      expect(COUNTRY_STATUTORY_COMPONENTS['IN']).not.toContain(StatutoryComponentType.PHILHEALTH);
      expect(COUNTRY_STATUTORY_COMPONENTS['IN']).not.toContain(StatutoryComponentType.PAGIBIG);

      // Philippines should not have India components
      expect(COUNTRY_STATUTORY_COMPONENTS['PH']).not.toContain(StatutoryComponentType.EPF);
      expect(COUNTRY_STATUTORY_COMPONENTS['PH']).not.toContain(StatutoryComponentType.ESI);
      expect(COUNTRY_STATUTORY_COMPONENTS['PH']).not.toContain(StatutoryComponentType.PT);

      // Australia should not have India or Philippines components
      expect(COUNTRY_STATUTORY_COMPONENTS['AU']).not.toContain(StatutoryComponentType.EPF);
      expect(COUNTRY_STATUTORY_COMPONENTS['AU']).not.toContain(StatutoryComponentType.SSS);
    });
  });

  describe('getStatutoryComponentsForCountry', () => {
    it('should return correct components for India', () => {
      const components = getStatutoryComponentsForCountry('IN');
      expect(components).toHaveLength(4);
      expect(components).toEqual([
        StatutoryComponentType.EPF,
        StatutoryComponentType.ESI,
        StatutoryComponentType.PT,
        StatutoryComponentType.TDS,
      ]);
    });

    it('should return correct components for Philippines', () => {
      const components = getStatutoryComponentsForCountry('PH');
      expect(components).toHaveLength(3);
      expect(components).toEqual([
        StatutoryComponentType.SSS,
        StatutoryComponentType.PHILHEALTH,
        StatutoryComponentType.PAGIBIG,
      ]);
    });

    it('should return correct components for Australia', () => {
      const components = getStatutoryComponentsForCountry('AU');
      expect(components).toHaveLength(1);
      expect(components).toEqual([StatutoryComponentType.SUPERANNUATION]);
    });

    it('should return empty array for unknown country', () => {
      const components = getStatutoryComponentsForCountry('XX');
      expect(components).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      const components = getStatutoryComponentsForCountry('');
      expect(components).toEqual([]);
    });

    it('should be case-sensitive', () => {
      const components = getStatutoryComponentsForCountry('in');
      expect(components).toEqual([]);
    });
  });

  describe('isStatutoryComponentApplicable', () => {
    describe('India (IN)', () => {
      it('should return true for EPF', () => {
        expect(isStatutoryComponentApplicable('IN', StatutoryComponentType.EPF)).toBe(true);
      });

      it('should return true for ESI', () => {
        expect(isStatutoryComponentApplicable('IN', StatutoryComponentType.ESI)).toBe(true);
      });

      it('should return true for PT', () => {
        expect(isStatutoryComponentApplicable('IN', StatutoryComponentType.PT)).toBe(true);
      });

      it('should return true for TDS', () => {
        expect(isStatutoryComponentApplicable('IN', StatutoryComponentType.TDS)).toBe(true);
      });

      it('should return false for SSS (Philippines)', () => {
        expect(isStatutoryComponentApplicable('IN', StatutoryComponentType.SSS)).toBe(false);
      });

      it('should return false for PhilHealth (Philippines)', () => {
        expect(isStatutoryComponentApplicable('IN', StatutoryComponentType.PHILHEALTH)).toBe(false);
      });

      it('should return false for Superannuation (Australia)', () => {
        expect(isStatutoryComponentApplicable('IN', StatutoryComponentType.SUPERANNUATION)).toBe(false);
      });
    });

    describe('Philippines (PH)', () => {
      it('should return true for SSS', () => {
        expect(isStatutoryComponentApplicable('PH', StatutoryComponentType.SSS)).toBe(true);
      });

      it('should return true for PhilHealth', () => {
        expect(isStatutoryComponentApplicable('PH', StatutoryComponentType.PHILHEALTH)).toBe(true);
      });

      it('should return true for Pag-IBIG', () => {
        expect(isStatutoryComponentApplicable('PH', StatutoryComponentType.PAGIBIG)).toBe(true);
      });

      it('should return false for EPF (India)', () => {
        expect(isStatutoryComponentApplicable('PH', StatutoryComponentType.EPF)).toBe(false);
      });

      it('should return false for Superannuation (Australia)', () => {
        expect(isStatutoryComponentApplicable('PH', StatutoryComponentType.SUPERANNUATION)).toBe(false);
      });
    });

    describe('Australia (AU)', () => {
      it('should return true for Superannuation', () => {
        expect(isStatutoryComponentApplicable('AU', StatutoryComponentType.SUPERANNUATION)).toBe(true);
      });

      it('should return false for EPF (India)', () => {
        expect(isStatutoryComponentApplicable('AU', StatutoryComponentType.EPF)).toBe(false);
      });

      it('should return false for SSS (Philippines)', () => {
        expect(isStatutoryComponentApplicable('AU', StatutoryComponentType.SSS)).toBe(false);
      });
    });

    describe('Unknown country', () => {
      it('should return false for any component type', () => {
        expect(isStatutoryComponentApplicable('XX', StatutoryComponentType.EPF)).toBe(false);
        expect(isStatutoryComponentApplicable('XX', StatutoryComponentType.SSS)).toBe(false);
        expect(isStatutoryComponentApplicable('XX', StatutoryComponentType.SUPERANNUATION)).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty country code', () => {
        expect(isStatutoryComponentApplicable('', StatutoryComponentType.EPF)).toBe(false);
      });

      it('should be case-sensitive', () => {
        expect(isStatutoryComponentApplicable('in', StatutoryComponentType.EPF)).toBe(false);
        expect(isStatutoryComponentApplicable('ph', StatutoryComponentType.SSS)).toBe(false);
        expect(isStatutoryComponentApplicable('au', StatutoryComponentType.SUPERANNUATION)).toBe(false);
      });
    });
  });
});

