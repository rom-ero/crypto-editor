/* eslint-disable prettier/prettier */

import { getFunctionNameAndSymbolFromTag, getTagsFromText } from "@/utils/Tag"

export default function TagCache() {


    /**
    * Cache dla tagów bez formatowania np:
    * tag_z_tekstu => pobrana_z_api_nazwa_waluty
    * {{ Name / BTC}} => "Bitcoin"
    */
    const tagCache = new Map();


    /**
     * Waluty są zapisywane do dobiektu cache z ideksem  
     * mającym nazwę symbolu zapisaną małymi literami np
     * { btc: { id:"", symbol:"", name:"", ... } }
     */
    const _currenciesCache = {};

    /**
     * Metoda odświeża - tworzy lub uaktualnia   _currenciesCache oraz tagCache
     * 
     * @param {*} text 
     */
    const refresh = (text) => {

        //Pobieramy wszystkie tagi z tekstu
        let tags = getTagsFromText(text);

        if (tags) {
            tags.forEach((tag) => {

                let { fnName, symbol } = getFunctionNameAndSymbolFromTag(tag);

                let cacheIndex = symbol.toLowerCase();

                //Jeśli zadana funkcja to Name
                if (fnName.toLowerCase() === "name") {

                    //Jeżeli nie ma chache dla waluty, tworzymy go
                    if (!_currenciesCache[cacheIndex]) {

                        _currenciesCache[cacheIndex] = {
                            id: null,
                            symbol: symbol.toUpperCase(),
                            name: "",
                            currencyExist: true,
                            requestProgress: false,
                            exchanges: [], // W przypadku gdy chcemy mieć dostep do danych o wymianie
                        };

                        tagCache.set(tag, "");

                    } else {


                        if (_currenciesCache[cacheIndex].currencyExist === false)
                            //W przypadku gdy waluta nie istnieje zabezpieczamy się aby niepotrzebnie nie pobierać informacji o niej z api
                            tagCache.delete(tag);
                        else
                            //Przypisujemy pobraną wartosć nazwy dla konkretnego tagu 
                            tagCache.set(tag, _currenciesCache[cacheIndex]?.name ?? "");
                    }
                }
            });
        }

    }
    /**
     * Aktualizacja  cache 
     * @param {*} symbol 
     * @param {*} currency 
     */
    const updateSymbolCache = (symbol, currency) => {

        //Jeżeli waluta istnieje przypisujemy wartości id oraz name
        if (currency) {
            _currenciesCache[symbol].id = currency.id;
            _currenciesCache[symbol].name = currency.name;
        }
        else {
            //W przypadku gdy waluta nie istnieje usuwamy cache tagów i przypisujemy znacznik 
            //currencyExist = false dla nieistniejącej waluty
            removeTagCache(symbol);
            _currenciesCache[symbol].currencyExist = false;
        }

    };

    /**
     * Aktualizacja cache - metoda udostęniona na "zewnątrz obiektu"
     * @param {*} text 
     * @param {*} symbol 
     * @param {*} currency 
     */
    const update = (text, symbol, currency) => {

        updateSymbolCache(symbol, currency);
        refresh(text);

    }

    /**
     * Metoda tworzy listę symboli, dla których należy pobrać dane z API
     * @returns 
     */
    const getCurrencySymbolForApiRequest = () => {

        return Object.entries(_currenciesCache)
            .filter(([, currency]) => currency.name === "" && currency.currencyExist === true && currency.requestProgress === false)
            .map((currency) => currency[0]);

    }

    const getTagCache = () => {

        return tagCache;

    }

    const removeTagCache = (symbol) => {

        tagCache.forEach((value, key) => {

            let { symbol: symbolFromTag } = getFunctionNameAndSymbolFromTag(key);

            if (symbol.toLowerCase() === symbolFromTag.toLowerCase())
                tagCache.delete(key);

        })

    }

    /**
     * Metoda ustawia znacznik requestProgress informujący czy dane dla danej waluty są aktualnie pobierane.
     * Zabezpiecza przed wielokrotnym pobraniem w przypadku odświeżenia edytora
     * 
     * @param {*} index 
     * @param {*} value 
     */
    const setCurrencyRequestProgress = (index, value) => {
        _currenciesCache[index].requestProgress = value;
    }


    return {
        setRequestProgress: setCurrencyRequestProgress,
        getSymbolsForRequest: getCurrencySymbolForApiRequest,
        getTagCache,
        updateCache: update,
        refreshCache: refresh
    }

}