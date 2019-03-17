# Challenge Almacel 
![Kitten](https://github.com/sugaith/challenge_almacel/raw/master/print.png "A cute kitten")

## 1) Como rodar este aplicativo?

1.1) Para instalação do aplicativo, como pré-requisito deve-se preparar a máquina com o ambiente React-Native.

Intruções de como instalar o ambiente ReactNative: 
[https://facebook.github.io/react-native/docs/getting-started.html](https://facebook.github.io/react-native/docs/getting-started.html)

1.2) Com o ambiente ReactNative propriamente instalado na máquina, clone este repositório.
```console
$ git clone https://github.com/sugaith/challenge_almacel.git
```

1.3) Entre na pasta do projeto do ReactNative chamada 'andamas_almacel_RN_galImgs'
```console
$ cd andamas_almacel_RN_galImgs
```

1.4) Instale e linke os pacotes
```console
$ npm install
$ react-native link
```

1.5) Com um emulador aberto, ou um aparelho espetado na máquina, digite:
```console
$ react-native run-android
```
1.6) Para ler as mensagens de log do app, digite em outro terminal (opcional):
```console
$ react-native log-android
```

## 2) Comportamento:
2.1) Apenas primeira vez em que o App é executado, uma imagem é automaticamente baixada da internet, salva no aparelho e mostrada na tela.

2.2) O aplicativo possui um 'switch' de modo teste que comanda o seguinte fluxo:
- se setado como 'ON', os end-points serão "mockados", a partir de um dos exemplos contidos no arquivos zip deste desafio;
- se setado como 'OFF', os end-points obedecerão o IP e a PORTA setada.

2.3) Ao clicar no botão '**Fetch**' de cor verde, as imagens baixadas do endereço especificado são automaticamente salvas no aparelho e disponibilizadas na galeria.

2.3) Para passar as imagens, basta arrastar a tela para esquerda ou para direita.

## 3) Mais informações:
- O aplicativo foi feito em apenas uma classe: [App.js](https://github.com/sugaith/challenge_almacel/blob/master/andamas_almacel_RN_galImgs/App.js)

- o algoritmo de decodificação se encontra no método '**aplicaAlgoritmoDecode(rspJson)**'  

- a simulação (mock) dos end-points se encontram no método '**teste_Desafio()**'  





