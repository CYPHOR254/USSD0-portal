export interface CONFIG_INFO {
  appName: string;
  apiName: string;
  apiDataSources: SERVER_CONFIG[];
  apiMetaData: {
    officialName: string;
    currency: string;
    countryCode: string;
  };
  configMetaData: {
    firstPageName: string;
    contactName: string;
    contactNumber: string;
    description: string;
    contactEmail: string;
    clientName: string;
    shortCode: string;
    termsURL: string;
    contactWhatsApp: string;
    contactTwitter: string;
    contactFacebook: string;
    contactLocation: string;
    currencyCode: string;
  };
}

export interface EXISTING_CONFIG_DATA {
  [key: string]: string | object;
}

interface SERVER_CONFIG {
  host: string;
  port: number;
  protocol: string;
  method: string;
  path: string;
}
