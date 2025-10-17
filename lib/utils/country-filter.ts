export const getIncludeCountriesFilter = (
  showCurrentCountryResultsOnly: boolean | undefined,
  currentCountry: string | undefined,
  allowedCountries: string[] | undefined,
): string[] | undefined => {
  if (showCurrentCountryResultsOnly && currentCountry) {
    return [currentCountry];
  }
  return allowedCountries;
};
