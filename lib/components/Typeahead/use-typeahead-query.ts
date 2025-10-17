import { AutocompleteCommandInput, GeoPlacesClient, SuggestCommandInput } from "@aws-sdk/client-geo-places";
import { useQuery } from "@tanstack/react-query";
import { autocomplete, suggest } from "../../utils/api";

export type TypeaheadSource = "autocomplete" | "suggest";

export type TypeaheadSourceInput = Partial<AutocompleteCommandInput> | Partial<SuggestCommandInput>;

export type UseTypeaheadParams = {
  client: GeoPlacesClient;
  source: TypeaheadSource;
  sourceInput?: TypeaheadSourceInput;
  enabled: boolean;
};

export interface TypeaheadResultItem {
  title: string;
  placeId: string;
}

export const useTypeaheadQuery = ({ client, source, sourceInput, enabled }: UseTypeaheadParams) => {
  return useQuery({
    enabled,
    queryKey: ["typeahead", source, sourceInput],
    queryFn: () => {
      if (source === "autocomplete") {
        return getAutocompleteResults(client, {
          QueryText: "",
          ...(sourceInput as Partial<AutocompleteCommandInput>),
        });
      }

      if (source === "suggest") {
        return getSuggestResults(client, {
          QueryText: "",
          ...(sourceInput as Partial<SuggestCommandInput>),
        });
      }

      throw new Error(`Invalid value for typeahead source: '${source}'`);
    },
  });
};

const getAutocompleteResults = async (
  client: GeoPlacesClient,
  input: AutocompleteCommandInput,
): Promise<TypeaheadResultItem[]> => {
  const response = await autocomplete(client, input);

  return (
    response.ResultItems?.filter((item) => {
      return item.PlaceId && item.Address?.Label;
    }).map((item) => ({
      placeId: item.PlaceId!,
      title: item.Address!.Label!,
    })) ?? []
  );
};

const getSuggestResults = async (
  client: GeoPlacesClient,
  input: SuggestCommandInput,
): Promise<TypeaheadResultItem[]> => {
  const response = await suggest(client, {
    ...input,
    BiasPosition: input.BiasPosition ?? [0, 0],
  });

  return (
    response.ResultItems?.filter((item) => {
      return item.Place?.PlaceId && item.Title;
    }).map((item) => ({
      placeId: item.Place!.PlaceId!,
      title: item.Title!,
    })) ?? []
  );
};
