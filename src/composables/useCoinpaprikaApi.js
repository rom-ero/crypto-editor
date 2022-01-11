/* eslint-disable prettier/prettier */
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { useStore } from 'vuex'

import {
    createRequestError,
    createCurrencyError,
    createResponseError,
    createError,
} from "@/utils/RequestErrorUtils";



export default function useCoinpaprikaApi() {

    const baseUrl =
        "https://api.coinpaprika.com/v1/";

    const searchApiBaseUrl = "search/?c=currencies&modifier=symbol_search&limit=20&q=";

    // Wykorzystanie store dla przetrzymywania błędów
    const store = useStore()

    /**
     * Metoda tworzy obiekt błędu w zależności od pochodzenia błędu
     * Response - błąd zbyt wielu wywołań
     * Request - np. błedy w dostępie do API
     * 
     * @param {*} error 
     * @param {*} symbol 
     */
    const createErrorMessage = function (error, symbol) {
        if (error.response) {
            store.commit("addError", createResponseError(error, symbol));
        } else if (error.request) {
            store.commit("addError", createRequestError(error, symbol));
        } else {
            store.commit("addError", createError(error));
        }
    };


    //Metoda pobierająca 
    /**
     * Metoda pobiera dane dotyczące nazwy waluty.
     * UUID przeciwdziała wykorzystaniu chace przegladarki
     * 
     * @param {*} currencySymbol 
     * @param {*} callback 
     * @param {*} errorCallback 
     */
    const getCurrencyName = function (
        currencySymbol,
        callback,
        errorCallback
    ) {
        axios
            .get(baseUrl + searchApiBaseUrl + currencySymbol + "&uuid=" + uuidv4())
            .then((response) => {

                const currencies = response.data.currencies;

                let currencyFound = currencies.find(
                    (currency) => currency.symbol.toLowerCase() === currencySymbol.toLowerCase()
                );

                // Jeżeli waluty nie znaleziono raportujemy to do konsoli
                if (!currencyFound)
                    store.commit("addError", createCurrencyError(currencySymbol));

                // Tworzymy obiekt "zwrotny" dla poprawnego zakończenia zapytania
                let returnResponse = {
                    symbol: currencySymbol,
                    currency: currencyFound
                };

                callback(returnResponse);
            })
            .catch((error) => {
                errorCallback(error);

                //W przypadku błędu raportujemy to w konsoli
                createErrorMessage(error, currencySymbol);

                //W przypadku przekroczenia dopuszczalnego limitu zapytań ponawiamy to samo zpytanie z opoznieniem 
                //(najprostrza metoda bez mierzenia czasu zapytań)
                if (error.response) {
                    setTimeout(() => getCurrencyName(currencySymbol, callback, errorCallback), 500);
                }
            });
    }



    return {
        getCurrencyName,
    }

}