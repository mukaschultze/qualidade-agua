import { Component } from '@angular/core';
import { DatabaseService } from './database.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent {
  constructor(private database: DatabaseService) {
    this.database
      .runSql('SELECT * FROM dados_coletados')
      .subscribe((a) => {
        const data = a;
        const arrayJson = [];
        let first = true;
        let notEnd = false;
        let j = 0;

        for (let i = 0; i < data[0].values.length ; i++) {
          // 1: Bacia / 2: Município / 3:latitude_s / 4:"longitude_o" / 5:coordenadas_utm_e / 6: coordenadas_utm_n / 16: data_coleta
          if (i !== data[0].values.length - 1) {
            if ((data[0].values[i][1] === data[0].values[i + 1][1]) && (data[0].values[i][2] === data[0].values[i + 1][2])
              && (data[0].values[i][3] === data[0].values[i + 1][3]) && (data[0].values[i][4] === data[0].values[i + 1][4])
              && (data[0].values[i][5] === data[0].values[i + 1][5]) && (data[0].values[i][6] === data[0].values[i + 1][6])
              && (data[0].values[i][16] === data[0].values[i + 1][16]) && first) {
              arrayJson.push({
                bacia: data[0].values[i][1],
                municipio: data[0].values[i][2],
                lat: data[0].values[i][3],
                long: data[0].values[i][4],
                update: data[0].values[i][16],
                altitude: data[0].values[i][7],
                data: [{
                  parametro_conforme_artigo: data[0].values[i][9],
                  valor: data[0].values[i][11],
                  unidade: data[0].values[i][13]
                }]
              });
              j++;
              first = false;
              notEnd = true;

            } else if (((data[0].values[i][1] === data[0].values[i + 1][1]) && (data[0].values[i][2] === data[0].values[i + 1][2])
              && (data[0].values[i][3] === data[0].values[i + 1][3]) && (data[0].values[i][4] === data[0].values[i + 1][4])
              && (data[0].values[i][5] === data[0].values[i + 1][5]) && (data[0].values[i][6] === data[0].values[i + 1][6])
              && (data[0].values[i][16] === data[0].values[i + 1][16]) && !first) ) {
              arrayJson[j - 1].data.push({
                parametro_conforme_artigo: data[0].values[i][9],
                valor: data[0].values[i][11],
                unidade: data[0].values[i][13]
              });
            } else {
              arrayJson[j - 1].data.push({
                parametro_conforme_artigo: data[0].values[i][9],
                valor: data[0].values[i][11],
                unidade: data[0].values[i][13]
              });
              notEnd = false;
              first = true;
            }
          } else {
            if ((data[0].values[i][1] === data[0].values[i - 1][1]) && (data[0].values[i][2] === data[0].values[i - 1][2])
              && (data[0].values[i][3] === data[0].values[i - 1][3]) && (data[0].values[i][4] === data[0].values[i - 1][4])
              && (data[0].values[i][5] === data[0].values[i - 1][5]) && (data[0].values[i][6] === data[0].values[i - 1][6])
              && (data[0].values[i][16] === data[0].values[i - 1][16])) {
              arrayJson[j - 1].data.push({
                parametro_conforme_artigo: data[0].values[i][9],
                valor: data[0].values[i][11],
                unidade: data[0].values[i][13]
              });
            } else {
              arrayJson.push({
                bacia: data[0].values[i][1],
                municipio: data[0].values[i][2],
                lat: data[0].values[i][3],
                long: data[0].values[i][4],
                update: data[0].values[i][16],
                altitude: data[0].values[i][7],
                data: [{
                  parametro_conforme_artigo: data[0].values[i][9],
                  valor: data[0].values[i][11],
                  unidade: data[0].values[i][13]
                }]
              });
            }
          }

        }
        console.log(arrayJson);
        const jsonConvertedArray = JSON.stringify(arrayJson);
        console.log(jsonConvertedArray);
        console.log(data); });
  }
}
