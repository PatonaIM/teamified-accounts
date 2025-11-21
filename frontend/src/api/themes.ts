import api from '../services/authService';

export interface ThemeConfig {
  palette: {
    mode?: 'light' | 'dark';
    primary: {
      main: string;
      light?: string;
      dark?: string;
      contrastText?: string;
    };
    secondary: {
      main: string;
      light?: string;
      dark?: string;
      contrastText?: string;
    };
    error?: {
      main: string;
      light?: string;
      dark?: string;
    };
    warning?: {
      main: string;
      light?: string;
      dark?: string;
    };
    info?: {
      main: string;
      light?: string;
      dark?: string;
    };
    success?: {
      main: string;
      light?: string;
      dark?: string;
    };
    background?: {
      default?: string;
      paper?: string;
    };
    text?: {
      primary?: string;
      secondary?: string;
    };
  };
  typography: {
    fontFamily?: string;
    fontSize?: number;
    h1?: { fontSize?: string; fontWeight?: number };
    h2?: { fontSize?: string; fontWeight?: number };
    h3?: { fontSize?: string; fontWeight?: number };
    h4?: { fontSize?: string; fontWeight?: number };
    h5?: { fontSize?: string; fontWeight?: number };
    h6?: { fontSize?: string; fontWeight?: number };
    body1?: { fontSize?: string };
    body2?: { fontSize?: string };
    button?: { textTransform?: string; fontWeight?: number };
  };
  shape?: {
    borderRadius?: number;
  };
  componentStyles?: {
    buttonVariant?: 'text' | 'outlined' | 'contained';
    buttonElevation?: boolean;
    buttonBorderRadius?: number;
    buttonTextTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
    chipVariant?: 'filled' | 'outlined';
    chipBorderRadius?: number;
    cardBorderRadius?: number;
  };
  spacing?: number;
}

export interface UserTheme {
  id: string;
  userId: string;
  themeName: string;
  isActive: boolean;
  themeConfig: ThemeConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThemeDto {
  themeName: string;
  themeConfig: ThemeConfig;
  isActive?: boolean;
}

export interface UpdateThemeDto {
  themeName?: string;
  themeConfig?: ThemeConfig;
  isActive?: boolean;
}

export const themesApi = {
  getAllThemes: async (): Promise<UserTheme[]> => {
    const response = await api.get('/themes');
    return response.data;
  },

  getActiveTheme: async (): Promise<UserTheme | null> => {
    const response = await api.get('/themes/active');
    return response.data;
  },

  getThemeById: async (id: string): Promise<UserTheme> => {
    const response = await api.get(`/themes/${id}`);
    return response.data;
  },

  createTheme: async (data: CreateThemeDto): Promise<UserTheme> => {
    const response = await api.post('/themes', data);
    return response.data;
  },

  updateTheme: async (id: string, data: UpdateThemeDto): Promise<UserTheme> => {
    const response = await api.patch(`/themes/${id}`, data);
    return response.data;
  },

  activateTheme: async (id: string): Promise<UserTheme> => {
    const response = await api.patch(`/themes/${id}/activate`);
    return response.data;
  },

  deleteTheme: async (id: string): Promise<void> => {
    await api.delete(`/themes/${id}`);
  },
};
