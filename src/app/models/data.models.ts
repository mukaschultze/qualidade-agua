export interface Data{
    bacia: string;
    municipio: string;
    lat: number;
    long: number;
    update: string;
    altitude: number;
    data: Array<qualidade>

}

export interface qualidade{
    parametro: string;
    valor: string;
    unidade: string;
}