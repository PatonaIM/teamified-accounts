import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CurrencyDisplay from '../CurrencyDisplay';

describe('CurrencyDisplay', () => {
  it('should render formatted currency with symbol', () => {
    render(<CurrencyDisplay amount={1000} currencyCode="USD" decimalPlaces={2} />);
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
  });

  it('should render INR currency correctly', () => {
    render(<CurrencyDisplay amount={5000} currencyCode="INR" decimalPlaces={2} />);
    expect(screen.getByText('₹5,000.00')).toBeInTheDocument();
  });

  it('should render PHP currency correctly', () => {
    render(<CurrencyDisplay amount={2500} currencyCode="PHP" decimalPlaces={2} />);
    expect(screen.getByText('₱2,500.00')).toBeInTheDocument();
  });

  it('should render AUD currency correctly', () => {
    render(<CurrencyDisplay amount={750.50} currencyCode="AUD" decimalPlaces={2} />);
    expect(screen.getByText('A$750.50')).toBeInTheDocument();
  });

  it('should handle zero amount', () => {
    render(<CurrencyDisplay amount={0} currencyCode="USD" decimalPlaces={2} />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('should handle negative amounts', () => {
    render(<CurrencyDisplay amount={-500} currencyCode="USD" decimalPlaces={2} />);
    expect(screen.getByText('-$500.00')).toBeInTheDocument();
  });

  it('should respect custom decimal places', () => {
    render(<CurrencyDisplay amount={100.123} currencyCode="USD" decimalPlaces={3} />);
    expect(screen.getByText('$100.123')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <CurrencyDisplay amount={1000} currencyCode="USD" decimalPlaces={2} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render inline variant', () => {
    const { container } = render(
      <CurrencyDisplay amount={1000} currencyCode="USD" decimalPlaces={2} variant="inline" />
    );
    expect(container.firstChild).toHaveClass('inline');
  });

  it('should render bold variant', () => {
    const { container } = render(
      <CurrencyDisplay amount={1000} currencyCode="USD" decimalPlaces={2} variant="bold" />
    );
    expect(container.firstChild).toHaveClass('font-bold');
  });

  it('should show currency code when showCode is true', () => {
    render(<CurrencyDisplay amount={1000} currencyCode="USD" decimalPlaces={2} showCode={true} />);
    expect(screen.getByText(/USD/)).toBeInTheDocument();
  });

  it('should render with converted amount', () => {
    render(
      <CurrencyDisplay
        amount={1000}
        currencyCode="INR"
        decimalPlaces={2}
        convertedAmount={12}
        convertedCurrencyCode="USD"
      />
    );
    
    expect(screen.getByText('₹1,000.00')).toBeInTheDocument();
    expect(screen.getByText(/\$12.00/)).toBeInTheDocument();
  });

  it('should render with loading state when no converted amount available', () => {
    render(
      <CurrencyDisplay
        amount={1000}
        currencyCode="INR"
        decimalPlaces={2}
        showConverted={true}
        convertedCurrencyCode="USD"
      />
    );
    
    expect(screen.getByText('₹1,000.00')).toBeInTheDocument();
  });

  it('should apply color based on value', () => {
    const { container: positiveContainer } = render(
      <CurrencyDisplay amount={1000} currencyCode="USD" decimalPlaces={2} colorize={true} />
    );
    expect(positiveContainer.firstChild).toHaveClass('text-green-600');

    const { container: negativeContainer } = render(
      <CurrencyDisplay amount={-500} currencyCode="USD" decimalPlaces={2} colorize={true} />
    );
    expect(negativeContainer.firstChild).toHaveClass('text-red-600');

    const { container: zeroContainer } = render(
      <CurrencyDisplay amount={0} currencyCode="USD" decimalPlaces={2} colorize={true} />
    );
    expect(zeroContainer.firstChild).toHaveClass('text-gray-600');
  });

  it('should handle unsupported currency code gracefully', () => {
    render(<CurrencyDisplay amount={1000} currencyCode="XYZ" decimalPlaces={2} />);
    expect(screen.getByText(/XYZ/)).toBeInTheDocument();
  });

  it('should render with tooltip when provided', () => {
    render(
      <CurrencyDisplay
        amount={1000}
        currencyCode="USD"
        decimalPlaces={2}
        tooltip="Total salary"
      />
    );
    
    const element = screen.getByText('$1,000.00').closest('[title="Total salary"]');
    expect(element).toBeInTheDocument();
  });
});

