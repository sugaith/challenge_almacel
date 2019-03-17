/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
    Platform, StyleSheet, Text, View,
    TouchableHighlight, TouchableOpacity, Switch,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import DialogInput from 'react-native-dialog-input';
import RNFetchBlob from 'react-native-fetch-blob'
import Gallery from 'react-native-image-gallery';

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
    android:
        'Double tap R on your keyboard to reload,\n' +
        'Shake or press menu button for dev menu',
});


type Props = {};
export default class App extends Component<Props> {
    state = {
        IP: "10.10.0.5",
        PORTA: "4321",
        lista_imagensGaleria: [],

        //VARS DE CONTROLE
        dialogIPVisible: false,
        dialogPORTVisible: false,
        modo_teste: true,
    };
    async componentWillMount(): void {
        // se for primeira vez que o app abir, consulta uma imagem da net
        const ip = await AsyncStorage.getItem('primeiraVez');
        if (ip === null) {
            this._fetch1stImages();
            await AsyncStorage.setItem('primeiraVez', "false");
        }
        //consuta arquivos salvos
        this.negocio_abreGaleria();

    }
    componentDidMount(): void {
        // consulta dados : ip e porta
        this._aSync_consultaIp_Porta();
    }

    //metodo procura files na pasta padrao e joga na lista
    negocio_abreGaleria() {
        console.log("::: negocio_abreGaleria :::");
        let dirs = RNFetchBlob.fs.dirs;
        let path = dirs.CacheDir;

        RNFetchBlob.fs.ls(path)
        // files will an array contains filenames
            .then((files) => {
                console.log("files salvos ->");
                console.log(files);

                let listaimgAUX = this.state.lista_imagensGaleria;

                for (let i = 0; i < files.length; i++) {
                    //popula lista_imagensGaleria
                    let filename = files[i];
                    if (filename.includes(".")) {//se tem alguma extensao
                        RNFetchBlob.fs.readFile(path + "/" + filename, 'base64')
                            .then((data) => {
                                console.log("arquivo aberto");
                                //console.log(data);

                                //adiciona imagen na lista  a decodificando
                                listaimgAUX.unshift({source: {uri: `data:image/png;base64,${RNFetchBlob.base64.decode(data)}`}});
                                this.setState({lista_imagensGaleria: listaimgAUX});
                            })
                    }
                }
            })
    }

    _fetch1stImages() {
        // send http request
        //https://d2ci88w16yaf6n.cloudfront.net/p/assets/animations/hurricane_1e8e060c71635d9c72b776820991d419.png
        let dirs = RNFetchBlob.fs.dirs;
        let path = dirs.CacheDir + '/1stimg.png';

        RNFetchBlob.fetch('GET', 'https://pbs.twimg.com/profile_images/711520911082569728/CZvvAEVD_400x400.jpg', {
            // Authorization : 'Bearer access-token...',
        })
        // status code  200
            .then((res) => {
                // the conversion is done in native code
                let base64Str = res.base64();
                console.log("::: _fetch1stImages :::");
                console.log(base64Str);

                // write base64 data to file
                RNFetchBlob.fs.writeFile(path, RNFetchBlob.base64.encode(base64Str), 'base64')
                    .then(() => {
                        console.log('arquivo salvo - ' + path)
                    });

                let listaimgAUX = this.state.lista_imagensGaleria;
                listaimgAUX.unshift({source: {uri: `data:image/png;base64,${(base64Str)}`}});
                this.setState({lista_imagensGaleria: listaimgAUX});


                // the following conversions are done in js, it's SYNC
                let text = res.text();
                let json = res.json();

            })
            // Status code not 200
            .catch((errorMessage, statusCode) => {
                console.log('ERRO');
                console.log(errorMessage);
                console.log(statusCode);

            })
    }


    render() {
        //preparando a string ip:porta
        let ip_porta = '';
        if (this.state.IP === undefined)
            ip_porta = "indefinido, favor definir";
        else {
            ip_porta = this.state.IP;
            if (this.state.PORTA !== undefined) {
                ip_porta = ip_porta + ":" + this.state.PORTA;
            }
        }

        return (
            <View style={styles.container}>

                {/*INPUT DIALOG para IP*/}
                <DialogInput isDialogVisible={this.state.dialogIPVisible}
                             title={"IP"}
                             message={"Favor definir novo IP"}
                             hintInput={"ex: 192.168.2.15 ou http://webserv.etc"}
                             initValueTextInput={this.state.IP}
                             submitInput={(inputText) => {
                                 this.setState({
                                     IP: inputText,
                                     dialogIPVisible: false,
                                 });
                                 this._aSync_storeIP_Porta(inputText, undefined);
                             }}
                             closeDialog={() => {
                                 this.setState({dialogIPVisible: false})
                             }}>
                </DialogInput>
                {/*INPUT DIALOG para PORTA*/}
                <DialogInput isDialogVisible={this.state.dialogPORTVisible}
                             title={"PORTA"}
                             message={"Favor definir nova PORTA"}
                             hintInput={"ex: 2548 ou 8081"}
                             initValueTextInput={this.state.PORTA}
                             textInputProps={{keyboardType: "numeric"}}
                             submitInput={(inputText) => {
                                 this.setState({
                                     PORTA: inputText,
                                     dialogPORTVisible: false,
                                 });
                                 this._aSync_storeIP_Porta(undefined, inputText);
                             }}
                             closeDialog={() => {
                                 this.setState({dialogPORTVisible: false})
                             }}>
                </DialogInput>

                {/*LABELS INFORMATIVOS*/}
                <Text style={styles.welcome}>{"Desafio Galeria de Imagens - Almacel"}</Text>
                <Text style={styles.instructions}>{"IP:PORTA => " + ip_porta}</Text>

                {/*SWITCH DE TESTE*/}
                <View
                    style={{flexDirection: 'row', justifyContent: 'space-between'}}
                >
                    <Switch
                        value = {this.state.modo_teste}
                        onValueChange = {()=>{
                            this.setState({modo_teste: !this.state.modo_teste})
                        }}
                    />

                    <Text>
                        {"Modo teste: " + ((this.state.modo_teste)?"ON":"OFF")}
                    </Text>
                </View>

                {/*BOTOES*/}
                <View
                    style={{flexDirection: 'row', justifyContent: 'space-between'}}
                >
                    <TouchableHighlight
                        style={{backgroundColor: 'grey', padding: 8}}
                        onPress={() => {
                            this.setState({dialogIPVisible: true})
                        }}
                    >
                        <Text>Redefinir IP</Text>
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={{backgroundColor: 'grey', padding: 8, marginLeft: 5}}
                        onPress={() => {
                            this.setState({dialogPORTVisible: true})
                        }}
                    >
                        <Text>Redefinir PORTA</Text>
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={{backgroundColor: 'green', padding: 8, marginLeft: 10}}
                        onPress={() => {
                            if (this.state.modo_teste)
                                this.teste_Desafio();
                            else
                                this.negocio_FetchDesafio_121();
                        }}
                    >
                        <Text>FETCH</Text>
                    </TouchableHighlight>
                </View>

                {/*GALERIA DE IMAGENS*/}
                <Gallery
                    style={{flex: 1, backgroundColor: 'black'}}
                    images={this.state.lista_imagensGaleria}
                />


            </View>
        );
    }

    //METODO PARA RECUPERAR IP E PORTA SALVOS NO ASYNCSTORAGE
    _aSync_consultaIp_Porta = async () => {
        try {
            console.log("::::: metodo _aSync_consultaIp_Porta ::::::");
            const ip = await AsyncStorage.getItem('IP');

            if (ip !== null) {
                console.log("IP salvo: ", ip);
                this.setState({IP: ip});
                console.log("-- IP RECUPERADA");

                const porta = await AsyncStorage.getItem('PORTA');
                if (porta !== null) {
                    console.log("PORTA salva: ", porta);
                    this.setState({PORTA: porta});
                    console.log("-- PORTA RECUPERADA");
                }
            } else {
                //segue processo normal
            }
        } catch (error) {
            console.log("ERRO ao consutar  ASYNC_storage: " + error);
        }
    };

    //METODO PARA SALVAR IP E PORTA NO ASYNCSTORAGE
    _aSync_storeIP_Porta = async (IP, PORTA) => {
        console.log("::::: metodo _aSync_storeIP_Porta ::::::");
        try {
            if (IP !== undefined)
                if (IP !== "") {
                    await AsyncStorage.setItem('IP', IP);
                    console.log("-- IP SALVO");
                }
            if (PORTA !== undefined)
                if (PORTA !== "") {
                    await AsyncStorage.setItem('PORTA', PORTA);
                    console.log("-- PORTA SALVO");
                }
        } catch (error) {
            // Error saving data
            console.log(" ::: ERRO AO DADOS NO ASYNC! :::");
        }
    };

    //funcionalidade para MOCKER / SIMULAR o endpoint 121 e 122
    teste_Desafio() {
        console.log(":::: TESTE DESAFIO :::");
        console.log(":::: TESTE DESAFIO :::");
        console.log(":::: TESTE DESAFIO :::");
        resp =
            {
                "requestToken": "Cs4JW1-SCF3Mp-vI08F-Wv6-FVnDSZ",
                "delimiters": {
                    "alpha": "--------",
                    "omega": "========"
                },
                "encData": [
                    "8AXGf1lzNR0hmWufcbza",
                    "AJ4cRuyNrCJhQqPb64",
                    "rlrJjSUdsABBIFPeI",
                    "sDmpsvnEAaRAVmJvpH6BsJUzAWltDkt",
                    "GiBXZAAY6IPJf3fL7Zn6hF16",
                    "--------",
                    "vg2zi82FDilokjEjJmlSIdM",
                    "v30A6KPlzpWS4q26J8NyHCi1L",
                    "========",
                    "xwLAYpDOYtrPzC1DS1hyU",
                    "ZqgdI504XaOXc3oY4PeaXvlsqg6",
                    "--------",
                    "Y2NoDhueOJeVcI4Q2644AwWCRw0"
                ]
            };

        let string_decoded = this.aplicaAlgoritmoDecode(resp);

        console.log(string_decoded);

        if (string_decoded ===
        'L1iCHyN8J62q4SWpzlPK6A03vMdISlmJjEjkoliDF28iz2gv8AXGf1lzNR0hmWufcbzaAJ4cRuyNrCJhQqPb64rlrJjSUdsABBIFPeIsDmpsvnEAaRAVmJvpH6BsJUzAWltDktGiBXZAAY6IPJf3fL7Zn6hF166gqslvXaeP4Yo3cXOaX405IdgqZUyh1SD1CzPrtYODpYALwxY2NoDhueOJeVcI4Q2644AwWCRw0'
        ){
            alert("SUCESSO, decoded: " + string_decoded);
            let resp_body = "data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7";
            resp_body = resp_body.substring(22, resp_body.length);
            console.log("base64 ==>");
            console.log(resp_body);

            //ADICIONA IMAGEM NA LISTA E SALVA
            let dirs = RNFetchBlob.fs.dirs;
            let path = dirs.CacheDir + '/img'+ new Date().valueOf() +'.png';

            let listaimgAUX = this.state.lista_imagensGaleria;
            // listaimgAUX.push({source: {uri: `data:image/png;base64,${RNFetchBlob.base64.decode(resp_body)}`}});
            listaimgAUX.unshift({source: {uri: `data:image/png;base64,${(resp_body)}`}});
            this.setState({lista_imagensGaleria: listaimgAUX});

            RNFetchBlob.fs.writeFile(path, RNFetchBlob.base64.encode(resp_body), 'base64')
                .then(() => {
                    console.log('arquivo salvo - ' + path)
                });
        }else{
            alert("FALHA");
        }

    }

    negocio_FetchDesafio_122(requestToken, decoded){
        console.log(":::: negocio_FetchDesafio_122 ::::");
        fetch(ip_porta + "/imgChall", {
            method: 'POST ',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requestToken: requestToken,
                decoded: decoded
            }),
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(":::: resp negocio_FetchDesafio_122 ::::");
                console.log(responseJson);

                //TODO falta testar o formato que a imagem virá ** pode dar erro ao salvar
                //todo talvez tenha que usar o decode/encode

                let dirs = RNFetchBlob.fs.dirs;
                let path = dirs.CacheDir + '/img'+ new Date().valueOf() +'.png';

                let listaimgAUX = this.state.lista_imagensGaleria;
                // listaimgAUX.push({source: {uri: `data:image/png;base64,${RNFetchBlob.base64.decode(resp_body)}`}});
                listaimgAUX.unshift({source: {uri: responseJson}});
                this.setState({lista_imagensGaleria: listaimgAUX});

                let resp_body = resp_body.substring(22, resp_body.length);
                console.log("base64 ==>");
                console.log(resp_body);
                RNFetchBlob.fs.writeFile(path, RNFetchBlob.base64.encode(resp_body), 'base64')
                    .then(() => {
                        console.log('arquivo salvo - ' + path)
                    });
            })
            .catch((error) => {
                console.log(":::::: ERRO CATCH negocio_FetchDesafio_122 :::::");
                console.log(error);
                alert("Erro de network");

            });
    }

    negocio_FetchDesafio_121() {
        console.log(":::: negocio_FetchDesafio_121 ::::");

        //preparando a string ip:porta
        let ip_porta = '';
        if ((this.state.IP === undefined) || (this.state.IP === "")){
            alert("Favor definir ip e ou porta");
            return;
        }else {
            ip_porta = this.state.IP;
            if (this.state.PORTA !== undefined) {
                ip_porta = ip_porta + ":" + this.state.PORTA;
            }
        }

        fetch(ip_porta + "/imgChall", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Auth': 'pi31415',
            },
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(":::: resp negocio_FetchDesafio_121 ::::");
                console.log(responseJson);

                //aplica algoritimo de decode
                let string_decoded = this.aplicaAlgoritmoDecode(responseJson);

                this.negocio_FetchDesafio_122(responseJson.requestToken, string_decoded );
            })
            .catch((error) => {
                console.log(":::::: ERRO NO CATCH negocio_FetchDesafio_121:::::");
                console.log(error);
                alert("Erro de network");
            });
    }

    aplicaAlgoritmoDecode(rspJson) {
        //Passos para implementacao do algoritmo:
        /*
        1 - captura os delimitadores alpha e omge, vetor de chunks
        2 - percoree a lista encData
            2.0 - constroi nova string a cada chunk
            2.1 - se achar o aplha, reverte ate ultimo delimit
            2.2 - se achar o omega, reverte tudo
         */
        let d_alpha = rspJson.delimiters.alpha;
        let d_omega = rspJson.delimiters.omega;
        let l_encData = rspJson.encData;
        let str_decoded = "";

        for (let i = 0; i < l_encData.length; i++) {
            //se for omega
            if (l_encData[i] === d_omega) {
                // reverte toda a string
                str_decoded = this.reverseString(str_decoded);
            } else {
                //se demilitador alpha
                if (l_encData[i] === d_alpha) {
                    //procura a posicao do ultimo delimitador ou do inicio no array
                    let subStr2rev = this.procuraString_ultimoDelimit(d_alpha, d_omega, l_encData, i, str_decoded);
                    //reverte a string retornada acima
                    subStr2rev = this.reverseString(subStr2rev);
                    //concatena com a str_decoded, removendo os ultimos chars de mesmo tamanho da string invertida
                    str_decoded = str_decoded.substring(0, str_decoded.length - subStr2rev.length) + subStr2rev;
                } else {
                    //'e chunk normal
                    str_decoded += l_encData[i];
                }
            }
        }

        return str_decoded;
    }

    //metodo que reverte uma string
    reverseString(str) {
        return str.split("").reverse().join("");
    }

    //metodo de procura a ultima ocorrencia de alpha ou omega
    procuraString_ultimoDelimit(d_alpha, d_omega, l_encData, posAtual, str_decoded) {
        let conta_chars = 0;//contagem de chars para fazer substring

        let ret_pos = posAtual;
        ret_pos--;//decrementa a pos atual pois 'e um delimit
        if (ret_pos >= 0) {
            while ((l_encData[ret_pos] !== d_alpha) && (l_encData[ret_pos] !== d_omega)) {
                conta_chars += l_encData[ret_pos].length;
                ret_pos--;
                if (ret_pos < 0) //break caso termine o vetor
                    break;
            }
        }

        //se nao houve contagem de chars, nao ha string para reverter
        if (conta_chars === 0)
            return "";
        else {
            //retorna substring a ser revertida
            return str_decoded.substring(str_decoded.length - conta_chars, str_decoded.length)
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});
