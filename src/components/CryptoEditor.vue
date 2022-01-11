<template>
  <div class="editors-wrapper">
    <Editor @onEditorChange="onEditorChange" />
    <EditorPreview :text="convertedText" />
  </div>
  <ErrorPreview :errors="requestErrors" />
</template>

<script>
import Editor from "@/components/Editor.vue";
import EditorPreview from "@/components/EditorPreview.vue";
import ErrorPreview from "@/components/ErrorPreview.vue";
import useCoinpaprikaApi from "@/composables/useCoinpaprikaApi";
import useTagsCache from "@/composables/useTagsCache";
import { useStore } from "vuex";
import { computed, ref, watch } from "vue";
import { replaceAll } from "@/utils/Tag";

export default {
  name: "CryptoEditor",
  components: {
    Editor,
    EditorPreview,
    ErrorPreview,
  },

  setup() {
    // ( Dla testów )
    // Zmienna przełącza w dwa tryby zadania.
    // Wartość TRUE - ograniczenia zapytań do API do 10/s
    // Wartość FALSE - ignorujemy ograniczenia zapytań, obsługa błędów z API
    let preventToManyRequestError = true;

    const requestCount = ref(0);

    let symbolsForRequest = [];

    let startRequestTime = 0;

    const MAX_REQUEST_COUNT = 10;

    const MAX_REQUEST_TIME = 1000;

    const convertedText = ref("");

    const store = useStore();

    const requestErrors = computed(() => store.state.errors);

    const { getCurrencyName } = useCoinpaprikaApi();

    const {
      setRequestProgress,
      getSymbolsForRequest,
      getTagCache,
      updateCache,
      refreshCache,
    } = useTagsCache();

    /**
     * Konwersja tagów do nazw waluty
     */
    const convertText = (text) => {
      convertedText.value = replaceAll(text, getTagCache());
    };

    /**
     * Pobranie danych z API
     */
    const getDataFromAPI = (symbol) => {
      setRequestProgress(symbol, true);

      getCurrencyName(
        symbol,
        (response) => {
          updateCache(convertedText.value, response.symbol, response.currency);

          //Kowertujemy tagi do nazwy za każdym razem gdy pobierzemy dane z API
          if (!preventToManyRequestError) {
            convertText(convertedText.value);
          }

          requestCount.value--;
        },
        (error) => {
          if (error.request) setRequestProgress(symbol, false);
        }
      );
    };

    watch(requestCount, (value) => {
      //Jeśli requestCount === 0 należy wysłać kolejne 10 żądań
      if (value === 0 && preventToManyRequestError) {
        let counter = 1;

        convertText(convertedText.value);

        requestCount.value =
          symbolsForRequest.length > MAX_REQUEST_COUNT
            ? MAX_REQUEST_COUNT
            : symbolsForRequest.length;

        // Sprawdzenie czasu jaki upłynął od wysłania ostatnich 10 żądań do api
        // Wartość dodatnia informuje że nie uppłyną jeszcze czas zdefiniowany w MAX_REQUEST_TIME
        let timeDiff = MAX_REQUEST_TIME - (Date.now() - startRequestTime);

        //Ustawienie opóźnienia dla kolejnych żądań
        let requestDelay = timeDiff < 0 ? 0 : timeDiff;

        setTimeout(() => {
          while (symbolsForRequest.length > 0 && counter <= MAX_REQUEST_COUNT) {
            counter++;
            getDataFromAPI(symbolsForRequest.pop());
          }

          startRequestTime = Date.now();
        }, requestDelay);
      }
    });

    /**
     * Obsłga event'u onEditorChange z edytora
     */
    const onEditorChange = (text) => {
      //Wysłanie zapytań dla walut, które nie mają przypisanej nazwy w cache
      let symbols = getSymbolsForRequest();

      //Przebudowa cache
      refreshCache(text);

      if (preventToManyRequestError) {
        /**
         * 1. ----------------------
         * Wysyłamy tylko pierwsze 10 zapytań reszta czeka w kolejce
         * Dane dla kolejki pobieramy gdy requestCount===0 w funkcji watch
         * ------------------------
         */

        let counter = 1;

        requestCount.value =
          symbols.length > MAX_REQUEST_COUNT
            ? MAX_REQUEST_COUNT
            : symbols.length;

        symbols().forEach((symbol) => {
          if (counter <= MAX_REQUEST_COUNT) {
            counter++;
            getDataFromAPI(symbol);
          } else {
            symbolsForRequest.push(symbol);
          }
        });

        startRequestTime = Date.now();
      } else {
        /**
         * 2.----------------------
         * W tym podejściu wysyłamy zapytania hurotowo nie przejmujac się limitem dla API,
         * W przypadku błędu zapytania są ponawiane
         * ------------------------
         */
        symbols().forEach((symbol) => {
          getDataFromAPI(symbol);
        });
      }

      //Konwersja tagów w tekście
      convertText(text);
    };

    return {
      onEditorChange,
      requestErrors,
      convertedText,
    };
  },
};
</script>
