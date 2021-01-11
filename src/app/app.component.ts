import { Component } from '@angular/core';
import { DatabaseService } from './database.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private database: DatabaseService) {
    this.database.runSql('SELECT * FROM dados_coletados WHERE longitude_o AND latitude_s !=  "" OR coordenadas_utm_e AND coordenadas_utm_n !=  ""').subscribe((a) => {
      // MAGIA NEGRA DO JS
      const obj = a.map((table) =>
        table.values.map((row) =>
          table.columns
            .map((colName, idx) => ({ [colName]: row[idx] }))
            .reduce((acc, cur) => ({ ...acc, ...cur }), {})
        )
      )[0];

      const arrayJson = [];
      let first = true;
      let notEnd = false;
      let j = 0;

      for (let i = 0; i < obj.length; i++) {
        if (i !== obj.length - 1) {
          if (
            obj[i]['identificacao_corpo_hidrico'] === obj[i + 1]['identificacao_corpo_hidrico'] &&
            obj[i]['bacia'] === obj[i + 1]['bacia'] &&
            obj[i]['municipio'] === obj[i + 1]['municipio'] &&
            obj[i]['latitude_s'] === obj[i + 1]['latitude_s'] &&
            obj[i]['longitude_o'] === obj[i + 1]['longitude_o'] &&
            obj[i]['coordenadas_utm_e'] === obj[i + 1]['coordenadas_utm_e'] &&
            obj[i]['coordenadas_utm_n'] === obj[i + 1]['coordenadas_utm_n'] &&
            obj[i]['data_coleta'] === obj[i + 1]['data_coleta'] &&
            first
          ) {
            arrayJson.push({
              bacia: obj[i]['bacia'],
              municipio: obj[i]['municipio'],
              lat: obj[i]['latitude_s'],
              long: obj[i]['longitude_o'],
              update: obj[i]['data_coleta'],
              altitude: obj[i]['altitude_m'],
              data: [
                {
                  parametro_conforme_artigo:
                    obj[i]['parametro_conforme_artigo'],
                  valor: obj[i]['valor'],
                  unidade: obj[i]['unidade'],
                },
              ],
            });
            j++;
            first = false;
            notEnd = true;
          } else if (
            obj[i]['identificacao_corpo_hidrico'] === obj[i + 1]['identificacao_corpo_hidrico'] &&
            obj[i]['bacia'] === obj[i + 1]['bacia'] &&
            obj[i]['municipio'] === obj[i + 1]['municipio'] &&
            obj[i]['latitude_s'] === obj[i + 1]['latitude_s'] &&
            obj[i]['longitude_o'] === obj[i + 1]['longitude_o'] &&
            obj[i]['coordenadas_utm_e'] === obj[i + 1]['coordenadas_utm_e'] &&
            obj[i]['coordenadas_utm_n'] === obj[i + 1]['coordenadas_utm_n'] &&
            obj[i]['data_coleta'] === obj[i + 1]['data_coleta'] &&
            !first
          ) {
            arrayJson[j - 1].data.push({
              parametro_conforme_artigo: obj[i]['parametro_conforme_artigo'],
              valor: obj[i]['valor'],
              unidade: obj[i]['unidade'],
            });
          } else {
            arrayJson[j - 1].data.push({
              parametro_conforme_artigo: obj[i]['parametro_conforme_artigo'],
              valor: obj[i]['valor'],
              unidade: obj[i]['unidade'],
            });
            notEnd = false;
            first = true;
          }
        } else {
          if (
            obj[i]['identificacao_corpo_hidrico'] === obj[i - 1]['identificacao_corpo_hidrico'] &&
            obj[i]['bacia'] === obj[i - 1]['bacia'] &&
            obj[i]['municipio'] === obj[i - 1]['municipio'] &&
            obj[i]['latitude_s'] === obj[i - 1]['latitude_s'] &&
            obj[i]['longitude_o'] === obj[i - 1]['longitude_o'] &&
            obj[i]['coordenadas_utm_e'] === obj[i - 1]['coordenadas_utm_e'] &&
            obj[i]['coordenadas_utm_n'] === obj[i - 1]['coordenadas_utm_n'] &&
            obj[i]['data_coleta'] === obj[i - 1]['data_coleta']
          ) {
            arrayJson[j - 1].data.push({
              parametro_conforme_artigo: obj[i]['parametro_conforme_artigo'],
              valor: obj[i]['valor'],
              unidade: obj[i]['unidade'],
            });
          } else {
            arrayJson.push({
              bacia: obj[i]['bacia'],
              municipio: obj[i]['municipio'],
              lat: obj[i]['latitude_s'],
              long: obj[i]['longitude_o'],
              update: obj[i]['data_coleta'],
              altitude: obj[i]['altitude_m'],
              data: [
                {
                  parametro_conforme_artigo:
                    obj[i]['parametro_conforme_artigo'],
                  valor: obj[i]['valor'],
                  unidade: obj[i]['unidade'],
                },
              ],
            });
          }
        }
      }
      console.log(arrayJson);
      console.log(obj);
    });
  }
}
