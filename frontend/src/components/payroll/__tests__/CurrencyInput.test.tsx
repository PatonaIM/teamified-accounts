import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CurrencyInput from '../CurrencyInput';

describe('CurrencyInput', () => {
  it('should render with label', () => {
    render(
      <CurrencyInput
        label="Amount"
        value={0}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
      />
    );
    
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
  });

  it('should display currency symbol as prefix', () => {
    render(
      <CurrencyInput
        label="Amount"
        value={1000}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
      />
    );
    
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('should display currency code as suffix', () => {
    render(
      <CurrencyInput
        label="Amount"
        value={1000}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
        showCode={true}
      />
    );
    
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('should format value with commas', () => {
    render(
      <CurrencyInput
        label="Amount"
        value={1000}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
      />
    );
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input.value).toBe('1,000.00');
  });

  it('should call onChange with numeric value on input', async () => {
    const user = userEvent.setup();
    const onChangeMock = vi.fn();
    
    render(
      <CurrencyInput
        label="Amount"
        value={0}
        onChange={onChangeMock}
        currencyCode="USD"
        decimalPlaces={2}
      />
    );
    
    const input = screen.getByLabelText('Amount');
    await user.clear(input);
    await user.type(input, '500');
    
    expect(onChangeMock).toHaveBeenLastCalledWith(500);
  });

  it('should handle decimal input', async () => {
    const user = userEvent.setup();
    const onChangeMock = vi.fn();
    
    render(
      <CurrencyInput
        label="Amount"
        value={0}
        onChange={onChangeMock}
        currencyCode="USD"
        decimalPlaces={2}
      />
    );
    
    const input = screen.getByLabelText('Amount');
    await user.clear(input);
    await user.type(input, '123.45');
    
    expect(onChangeMock).toHaveBeenLastCalledWith(123.45);
  });

  it('should show error for invalid decimal places', async () => {
    const user = userEvent.setup();
    
    render(
      <CurrencyInput
        label="Amount"
        value={100}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
      />
    );
    
    const input = screen.getByLabelText('Amount');
    await user.clear(input);
    await user.type(input, '100.123');
    
    expect(screen.getByText(/maximum 2 decimal places/i)).toBeInTheDocument();
  });

  it('should show error for amount below minimum', async () => {
    const user = userEvent.setup();
    
    render(
      <CurrencyInput
        label="Amount"
        value={50}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
        min={100}
      />
    );
    
    const input = screen.getByLabelText('Amount');
    await user.clear(input);
    await user.type(input, '50');
    
    expect(screen.getByText(/must be at least/i)).toBeInTheDocument();
  });

  it('should show error for amount above maximum', async () => {
    const user = userEvent.setup();
    
    render(
      <CurrencyInput
        label="Amount"
        value={150}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
        max={100}
      />
    );
    
    const input = screen.getByLabelText('Amount');
    await user.clear(input);
    await user.type(input, '150');
    
    expect(screen.getByText(/must not exceed/i)).toBeInTheDocument();
  });

  it('should show custom error message', () => {
    render(
      <CurrencyInput
        label="Amount"
        value={100}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
        error="Custom error message"
      />
    );
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should show helper text when no error', () => {
    render(
      <CurrencyInput
        label="Amount"
        value={100}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
        helperText="Enter amount in USD"
      />
    );
    
    expect(screen.getByText('Enter amount in USD')).toBeInTheDocument();
  });

  it('should be required when required prop is true', () => {
    render(
      <CurrencyInput
        label="Amount"
        value={0}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
        required={true}
      />
    );
    
    const input = screen.getByLabelText('Amount *') as HTMLInputElement;
    expect(input.required).toBe(true);
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <CurrencyInput
        label="Amount"
        value={100}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
        disabled={true}
      />
    );
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('should handle INR currency', () => {
    render(
      <CurrencyInput
        label="Amount"
        value={5000}
        onChange={() => {}}
        currencyCode="INR"
        decimalPlaces={2}
      />
    );
    
    expect(screen.getByText('₹')).toBeInTheDocument();
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input.value).toBe('5,000.00');
  });

  it('should handle PHP currency', () => {
    render(
      <CurrencyInput
        label="Amount"
        value={2500}
        onChange={() => {}}
        currencyCode="PHP"
        decimalPlaces={2}
      />
    );
    
    expect(screen.getByText('₱')).toBeInTheDocument();
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input.value).toBe('2,500.00');
  });

  it('should handle zero value', () => {
    render(
      <CurrencyInput
        label="Amount"
        value={0}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
      />
    );
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input.value).toBe('0.00');
  });

  it('should allow negative values when allowNegative is true', async () => {
    const user = userEvent.setup();
    const onChangeMock = vi.fn();
    
    render(
      <CurrencyInput
        label="Amount"
        value={0}
        onChange={onChangeMock}
        currencyCode="USD"
        decimalPlaces={2}
        allowNegative={true}
      />
    );
    
    const input = screen.getByLabelText('Amount');
    await user.clear(input);
    await user.type(input, '-100');
    
    expect(onChangeMock).toHaveBeenCalledWith(-100);
  });

  it('should prevent negative values when allowNegative is false', async () => {
    const user = userEvent.setup();
    
    render(
      <CurrencyInput
        label="Amount"
        value={100}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
        allowNegative={false}
      />
    );
    
    const input = screen.getByLabelText('Amount');
    await user.clear(input);
    await user.type(input, '-100');
    
    expect(screen.getByText(/negative values not allowed/i)).toBeInTheDocument();
  });

  it('should apply fullWidth prop', () => {
    const { container } = render(
      <CurrencyInput
        label="Amount"
        value={100}
        onChange={() => {}}
        currencyCode="USD"
        decimalPlaces={2}
        fullWidth={true}
      />
    );
    
    const formControl = container.querySelector('.MuiFormControl-root');
    expect(formControl).toHaveClass('MuiFormControl-fullWidth');
  });

  it('should handle paste events', async () => {
    const user = userEvent.setup();
    const onChangeMock = vi.fn();
    
    render(
      <CurrencyInput
        label="Amount"
        value={0}
        onChange={onChangeMock}
        currencyCode="USD"
        decimalPlaces={2}
      />
    );
    
    const input = screen.getByLabelText('Amount');
    await user.click(input);
    await user.paste('1234.56');
    
    expect(onChangeMock).toHaveBeenCalledWith(1234.56);
  });

  it('should clear value when empty string is entered', async () => {
    const user = userEvent.setup();
    const onChangeMock = vi.fn();
    
    render(
      <CurrencyInput
        label="Amount"
        value={100}
        onChange={onChangeMock}
        currencyCode="USD"
        decimalPlaces={2}
      />
    );
    
    const input = screen.getByLabelText('Amount');
    await user.clear(input);
    
    expect(onChangeMock).toHaveBeenCalledWith(0);
  });
});

