import { apiClient } from '../utils/apiClient';

export interface MasterCountryDto {
  myRowId?: number;
  id?: number;
  ssName?: string;
  ssCountry?: string;
  ssIsdCode?: string;
}

export interface MasterGenderDto {
  myRowId?: number;
  id?: number;
  ssName?: string;
}

export interface MasterTitleDto {
  myRowId?: number;
  id?: number;
  ssName?: string;
  ssTitleId?: string;
}

export interface MasterLookupDto {
  myRowId?: number;
  id?: number;
  name?: string;
}

export interface MarketTypeDto {
  myRowId?: number;
  id?: number;
  marketName?: string;
  status?: boolean;
}

export interface IsdCodeValuesDto {
  myRowId?: number;
  id?: number;
  codeValue?: number;
  countryName?: string;
  countryCode?: string;
  nationality?: string;
  status?: number;
}

export interface MasterPortfolioManagersDto {
  id?: number;
  ssName?: string;
  ssPortfolioManagerId?: string;
  ssServiceProviderType?: string;
  ssNameOfTheFirmValue?: string;
}

export interface MasterPmsPlansDto {
  id?: number;
  ssName?: string;
  ssInvestmentRouteValue?: string;
  ssPlanDescription?: string;
  versionNumber?: string;
  ssPlanId?: string;
  ssProductValue?: string;
  ssPmsValue?: string;
  ssPreferredBankValue?: string;
  ssSchemeValue?: string;
}

export interface MasterPmsBanksDto {
  id?: number;
  ssName?: string;
  ssPmsBankId?: string;
  ssPortfolioManagerValue?: string;
  ssBankValue?: string;
}

class ContentService {
  private baseUrl = '/api/clients/content';

  async getCountries() {
    const response = await apiClient.get<MasterCountryDto[]>(
      `${this.baseUrl}/master/countries`
    );
    return response.data;
  }

  async getGenders() {
    const response = await apiClient.get<MasterGenderDto[]>(
      `${this.baseUrl}/master/genders`
    );
    return response.data;
  }

  async getTitles() {
    const response = await apiClient.get<MasterTitleDto[]>(
      `${this.baseUrl}/master/titles`
    );
    return response.data;
  }

  async getNationalities() {
    const response = await apiClient.get<MasterLookupDto[]>(
      `${this.baseUrl}/master/nationalities`
    );
    return response.data;
  }

  async getMarketTypes() {
    const response = await apiClient.get<MarketTypeDto[]>(
      `${this.baseUrl}/master/market-types`
    );
    return response.data;
  }

  async getIsdCodes() {
    const response = await apiClient.get<IsdCodeValuesDto[]>(
      `${this.baseUrl}/master/isd-codes`
    );
    return response.data;
  }

  async getPmsManagers() {
    const response = await apiClient.get<MasterPortfolioManagersDto[]>(
      `${this.baseUrl}/master/pms-managers`
    );
    return response.data;
  }

  async getPmsPlans() {
    const response = await apiClient.get<MasterPmsPlansDto[]>(
      `${this.baseUrl}/master/pms-plans`
    );
    return response.data;
  }

  async getPmsBanks() {
    const response = await apiClient.get<MasterPmsBanksDto[]>(
      `${this.baseUrl}/master/pms-banks`
    );
    return response.data;
  }
}

export const contentService = new ContentService();
