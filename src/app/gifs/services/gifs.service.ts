import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment.development';
import  type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, Observable, tap } from 'rxjs';

const GIF_KEY = 'gifs';
const loadFromLocalStorage = (): Record<string, Gif[]> => {
  const gifsFromLocalStorage = localStorage.getItem(GIF_KEY) ?? '{}';
  const gifs = JSON.parse(gifsFromLocalStorage);
  return gifs;
}

@Injectable( {providedIn: 'root'})
export class GifService {
  // inyectando el cliente
  private http = inject(HttpClient);

  trendingGifs = signal<Gif[]>([]);
  trendingGifsGroup = computed<Gif[][]>(() => {
    const groups = [];
      // recorremos esta colección ya que queremos construir una tupla de 3 elementos de un array para la coleccion gral de arrays de gifs
      for (let i = 0; i < this.trendingGifs().length; i += 3) {
        groups.push(this.trendingGifs().slice(i, i + 3));
      }
    return groups;
  })

  trendingGifsLoading = signal(false);
  private trendingPage = signal(0);

  searchHistory = signal<Record<string, Gif[]>>(loadFromLocalStorage());
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

  constructor() {
    this.loadTrendingGifs();
  }

  saveGifsToLocalStorage = effect( ()=> {
    const historyString = JSON.stringify(this.searchHistory());
    localStorage.setItem(GIF_KEY, historyString);
  })

  loadTrendingGifs(): void {
    if (this.trendingGifsLoading()) return;
    console.log('entra');
    this.trendingGifsLoading.set(true);
    this.http.get<GiphyResponse>(`${ environment.giphyUrl}/gifs/trending`, {
      params: {
        api_key: environment.giphyApiKey,
        limit: 20,
        offset: this.trendingPage() * 20
      }
    })
    .subscribe(( resp ) => {
      const gifs = GifMapper.mapGiphyitemsToGifArray(resp.data);
      // trae los nuevos 20 gifs a la coleccion y los une a los que ya habia traido antes
      this.trendingGifs.update(currentGifs => [
        ...currentGifs,
        ...gifs
      ]);
      // actualiza el numero de pagina
      this.trendingPage.update (currentPage => ++currentPage)
      this.trendingGifsLoading.set(false);
    });
  }

  searchGifs(query: string): Observable<Gif[]> {
    return this.http.get<GiphyResponse>(`${ environment.giphyUrl}/gifs/search`, {
      params: {
        api_key: environment.giphyApiKey,
        q: query,
        limit: 20
      }
    })
    .pipe(
      map( ({ data  }) => data ),
      map( (items) => GifMapper.mapGiphyitemsToGifArray(items)),

      // Historial
      tap((items) => {
        this.searchHistory.update((history) => ({
          ...history,
          [query.toLocaleLowerCase()]: items
        }));
      })
    );
  }

  getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query] ?? [];
  }


}
