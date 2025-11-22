import { RegionConfiguration } from '../region-configuration.entity';
import { Country } from '../country.entity';

describe('RegionConfiguration Entity', () => {
  it('should be defined', () => {
    expect(new RegionConfiguration()).toBeDefined();
  });

  it('should create a region configuration with all required fields', () => {
    const config = new RegionConfiguration();
    config.configKey = 'overtime_multiplier';
    config.configValue = { multiplier: 2.0 };
    config.description = 'Overtime rate multiplier for India';
    config.isActive = true;

    expect(config.configKey).toBe('overtime_multiplier');
    expect(config.configValue).toEqual({ multiplier: 2.0 });
    expect(config.description).toBe('Overtime rate multiplier for India');
    expect(config.isActive).toBe(true);
  });

  it('should support country relationship', () => {
    const country = new Country();
    country.code = 'IN';
    country.name = 'India';
    
    const config = new RegionConfiguration();
    config.country = country;
    config.configKey = 'overtime_multiplier';
    
    expect(config.country).toBeDefined();
    expect(config.country.code).toBe('IN');
  });

  it('should store India-specific configurations', () => {
    const configs = [
      {
        key: 'overtime_multiplier',
        value: { multiplier: 2.0 },
      },
      {
        key: 'epf_threshold',
        value: { threshold: 15000, rate: 12 },
      },
      {
        key: 'esi_threshold',
        value: { threshold: 21000, employeeRate: 0.75, employerRate: 3.25 },
      },
      {
        key: 'professional_tax',
        value: { maxAmount: 2500, slabs: [{ from: 0, to: 10000, amount: 0 }] },
      },
    ];

    configs.forEach((data) => {
      const config = new RegionConfiguration();
      config.configKey = data.key;
      config.configValue = data.value;
      
      expect(config.configKey).toBe(data.key);
      expect(config.configValue).toEqual(data.value);
    });
  });

  it('should store Philippines-specific configurations', () => {
    const configs = [
      {
        key: 'overtime_multiplier_regular',
        value: { multiplier: 1.25 },
      },
      {
        key: 'overtime_multiplier_holiday',
        value: { multiplier: 2.0 },
      },
      {
        key: 'night_shift_differential',
        value: { premium: 0.10, startHour: 22, endHour: 6 },
      },
      {
        key: 'sss_contribution_table',
        value: { minSalary: 0, maxSalary: 30000, brackets: [] },
      },
    ];

    configs.forEach((data) => {
      const config = new RegionConfiguration();
      config.configKey = data.key;
      config.configValue = data.value;
      
      expect(config.configKey).toBe(data.key);
      expect(config.configValue).toEqual(data.value);
    });
  });

  it('should support flexible JSON storage', () => {
    const config = new RegionConfiguration();
    config.configKey = 'complex_config';
    config.configValue = {
      rules: [
        { condition: 'salary > 50000', action: 'apply_surcharge' },
        { condition: 'tenure > 5', action: 'apply_bonus' },
      ],
      metadata: {
        version: '1.0',
        lastUpdated: '2024-01-01',
      },
    };
    
    expect(config.configValue.rules).toHaveLength(2);
    expect(config.configValue.metadata.version).toBe('1.0');
  });

  it('should have timestamps', () => {
    const config = new RegionConfiguration();
    config.createdAt = new Date();
    config.updatedAt = new Date();
    
    expect(config.createdAt).toBeInstanceOf(Date);
    expect(config.updatedAt).toBeInstanceOf(Date);
  });

  it('should support active/inactive status', () => {
    const activeConfig = new RegionConfiguration();
    activeConfig.isActive = true;
    expect(activeConfig.isActive).toBe(true);
    
    const inactiveConfig = new RegionConfiguration();
    inactiveConfig.isActive = false;
    expect(inactiveConfig.isActive).toBe(false);
  });
});

