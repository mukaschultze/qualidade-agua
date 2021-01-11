import { SqlJs } from "sql.js/module";

export interface Data{
    bacia:  SqlJs.ValueType;
    municipio: SqlJs.ValueType;
    lat: SqlJs.ValueType;
    long: SqlJs.ValueType;
    update: SqlJs.ValueType;
    altitude: SqlJs.ValueType;
    data: Array<qualidade>

}

export interface qualidade{
    parametro_conforme_artigo: SqlJs.ValueType;
    valor: SqlJs.ValueType;
    unidade: SqlJs.ValueType;
}