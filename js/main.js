var GUI = {
	desenharTabuleiro: function(id, tabuleiro)
	{
		console.log(tabuleiro.celulas[3][0]);
		var tabuleiroDOM = document.querySelector(id);
		while(tabuleiroDOM.firstChild)
			tabuleiroDOM.removeChild(tabuleiroDOM.firstChild);
		for(var i = 0; i < tabuleiro.linhas; i++)
		{
			for(var j = 0; j < tabuleiro.colunas; j++)
			{
				var novaCelula = document.createElement('div');
				novaCelula.setAttribute('linha', i);
				novaCelula.setAttribute('coluna', j);
				novaCelula.className = 'celula celula-' + tabuleiro.celulas[i][j].cor;
				if(tabuleiro.celulas[i][j].marcada || tabuleiro.celulas[i][j].pulo)
					novaCelula.className += ' celula-movimento';
				if(!tabuleiro.celulas[i][j].peca.ehVazia())
				{
					var novaPeca = document.createElement('img');
					novaPeca.setAttribute('src', 'img/preta.png');
					if(tabuleiro.celulas[i][j].peca.ehBranca())
						novaPeca.setAttribute('src', 'img/branca.png');
					novaPeca.className = 'peca';
					novaCelula.appendChild(novaPeca);
				}
				novaCelula.addEventListener('click', function()
				{
					GUI.celulaClicada(tabuleiro, parseInt(this.getAttribute('linha')), parseInt(this.getAttribute('coluna')));
					GUI.desenharTabuleiro(id, tabuleiro);
				});
				tabuleiroDOM.appendChild(novaCelula);
			}
		}
		console.log(tabuleiro);
	},
	celulaClicada: function(tabuleiro, i, j)
	{
		if(tabuleiro.celulas[i][j].marcada)
		{
			tabuleiro.selecionada.trocarPecaCom(tabuleiro.celulas[i][j]);
			tabuleiro.desmarcarTodas();
			if(tabuleiro.estado == DamasJS.Estado.ESPERANDO_BRANCA)
				tabuleiro.estado =  DamasJS.Estado.ESPERANDO_PRETA;
			else
				tabuleiro.estado = DamasJS.Estado.ESPERANDO_BRANCA;
		}
		else if(tabuleiro.celulas[i][j].pulo)
		{
			console.log(tabuleiro.pulos);
			for(var k = 0; k < tabuleiro.pulos.length; k++)
			{
				if(tabuleiro.pulos[k].destino == tabuleiro.celulas[i][j])
				{
					tabuleiro.selecionada.pularPara(tabuleiro.pulos[k].destino, tabuleiro.pulos[k].meio);
					tabuleiro.selecionar(tabuleiro.pulos[k].destino);
					if(tabuleiro.pulos.length == 0)
					{
						tabuleiro.desmarcarTodas();
						if(tabuleiro.estado == DamasJS.Estado.ESPERANDO_BRANCA)
							tabuleiro.estado =  DamasJS.Estado.ESPERANDO_PRETA;
						else
							tabuleiro.estado = DamasJS.Estado.ESPERANDO_BRANCA;
						break;	
					}
					
				}
			}
		}
		else
		{
			if(tabuleiro.estado == DamasJS.Estado.ESPERANDO_BRANCA &&
			   tabuleiro.celulas[i][j].peca.ehBranca() ||
			   tabuleiro.estado == DamasJS.Estado.ESPERANDO_PRETA &&
			   tabuleiro.celulas[i][j].peca.ehPreta())
			{
				tabuleiro.selecionar(tabuleiro.celulas[i][j]);
			}	
		}
	}
};

var DamasJS = {
	Estado: {
		ESPERANDO_BRANCA: 'ESPERANDO_BRANCA',
		ESPERANDO_PRETA: 'ESPERANDO_PRETA'
	},
	Cor: {
		PRETA: 'preta',
		BRANCA: 'branca',
		NENHUMA: 'nenhuma'
	},
	PecaPreta: function() {
		this.cor = DamasJS.Cor.PRETA;
		this.ehPreta = function() { return true; };
		this.ehBranca = function() { return false; };
		this.ehVazia = function() {return false; }
	},
	PecaBranca: function() {
		this.cor = DamasJS.Cor.BRANCA;
		this.ehPreta = function() { return false; };
		this.ehBranca = function() { return true; };
		this.ehVazia = function() {return false; }
	},
	PecaVazia: function() {
		this.cor = DamasJS.Cor.NENHUMA;
		this.ehPreta = function() { return false; };
		this.ehBranca = function() { return false; };
		this.ehVazia = function() {return true; }
	},
	Celula: function(linha, coluna, cor)
	{
		this.linha = linha;
		this.coluna = coluna;
		this.cor = cor;
		this.vizinhos = [];
		this.direcaoVizinhos = [];
		this.marcada = false;
		this.pulo = false;
		this.peca = new DamasJS.PecaVazia();
		this.trocarPecaCom = function(outraCelula)
		{
			var aux = outraCelula.peca;
			outraCelula.peca = this.peca;
			this.peca = aux;
		};
		this.pularPara = function(outraCelula, celulaDoMeio)
		{
			celulaDoMeio.peca = new DamasJS.PecaVazia();
			this.trocarPecaCom(outraCelula);
		};
		this.distancia = function(outraCelula)
		{
			return Math.abs(this.linha-outraCelula.linha) + Math.abs(this.coluna-outraCelula.coluna);
		};
	},
	Tabuleiro: function(linhas, colunas, pecas){
		this.linhas = linhas;
		this.colunas = colunas;
		this.celulas = [];
		this.marcadas = [];
		this.estado = DamasJS.Estado.ESPERANDO_BRANCA;
		this.selecionada = null;
		this.pulos = [];
		this.assinalarOsVizinhosDaProximaLinhaParaUmaLinha = function(indice)
		{
			var linha = this.celulas[indice];
			var proximaLinha = this.celulas[indice+1];
			var primeiraCelulaDaLinha = linha[0];
			var ultimaCelulaDaLinha = linha[linha.length-1];
			var segundaCelulaDaProximaLinha = proximaLinha[1];
			var penultimaCelulaDaProximaLinha = proximaLinha[proximaLinha.length-2];
			primeiraCelulaDaLinha.vizinhos.push(segundaCelulaDaProximaLinha);
			for(var j = 1; j < this.colunas-1; j++)
			{
				linha[j].vizinhos.push(proximaLinha[j-1]);
				linha[j].vizinhos.push(proximaLinha[j+1]);
			}
			ultimaCelulaDaLinha.vizinhos.push(penultimaCelulaDaProximaLinha);
		};
		this.assinalarOsVizinhosDaLinhaAnteriorParaUmaLinha = function(indice)
		{
			var linha = this.celulas[indice];
			var linhaAnterior = this.celulas[indice-1];
			var primeiraCelulaDaLinha = linha[0];
			var ultimaCelulaDaLinha = linha[linha.length-1];
			var segundaCelulaDaLinhaAnterior = linhaAnterior[1];
			var penultimaCelulaDaLinhaAnterior = linhaAnterior[linhaAnterior.length-2];
			primeiraCelulaDaLinha.vizinhos.push(segundaCelulaDaLinhaAnterior);
			for(var j = 1; j < this.colunas-1; j++)
			{	
				linha[j].vizinhos.push(linhaAnterior[j-1]);
				linha[j].vizinhos.push(linhaAnterior[j+1]);
			}
			ultimaCelulaDaLinha.vizinhos.push(penultimaCelulaDaLinhaAnterior);
		};
		this.assinalarVizinhanca = function()
		{
			this.assinalarOsVizinhosDaProximaLinhaParaUmaLinha(0);
			for(var i = 1; i < linhas-1; i++)
			{
				this.assinalarOsVizinhosDaLinhaAnteriorParaUmaLinha(i);
				this.assinalarOsVizinhosDaProximaLinhaParaUmaLinha(i);
			}
			this.assinalarOsVizinhosDaLinhaAnteriorParaUmaLinha(this.celulas.length-1);
		};
		this.marcar = function(celula)
		{
			if(celula.peca.ehVazia())
			{
				celula.marcada = true;
				this.marcadas.push(celula);
			}
		};
		this.desmarcarTodas = function()
		{
			for(var i = 0; i < this.marcadas.length; i++)
				this.marcadas[i].marcada = false;
			for(var i = 0; i < this.pulos.length; i++)
				this.pulos[i].destino.pulo = false;
			this.marcadas = [];
			this.pulos = [];
		};
		this.criarCelulas = function()
		{
			for(var i = 0; i < this.linhas; i++)
			{
				this.celulas.push([]);
				for(var j = 0; j < this.colunas; j++)
				{
					var cor = (((i % 2 == 1) ^ (j % 2 == 1)) ? DamasJS.Cor.PRETA : DamasJS.Cor.BRANCA);
					this.celulas[i].push(new DamasJS.Celula(i,j, cor));
				}
			}
		};
		this.adicionarPecas = function(pecas)
		{
			var linha = 0;
			var coluna = 0;
			var restante = pecas;
			while(restante > 0)
			{
				if(this.celulas[linha][coluna].cor == DamasJS.Cor.PRETA)
				{
					this.celulas[linha][coluna].peca = new DamasJS.PecaBranca();
					restante--;
				}
				coluna++;
				if(coluna == this.colunas)
					linha++;
				coluna = coluna % this.colunas;
			}
			restante = pecas;
			linha = this.celulas.length-1;
			coluna = this.celulas[linha-1].length-1;
			while(restante > 0)
			{
				if(this.celulas[linha][coluna].cor == DamasJS.Cor.PRETA)
				{
					this.celulas[linha][coluna].peca = new DamasJS.PecaPreta();
					restante--;
				}
				coluna--;
				if(coluna == -1)
				{
					linha--;
					coluna = this.celulas[linha].length-1;
				}
			}
		};
		this.marcarPulos = function(celula)
		{
			for(var i = 0; i < celula.vizinhos.length; i++)
			{
				var vizinho = celula.vizinhos[i];
				for(var j = 0; j < vizinho.vizinhos.length; j++)
				{
					var vizinhoDoVizinho = vizinho.vizinhos[j];
					var corDiferente = (celula.peca.ehPreta() && vizinho.peca.ehBranca()) ||
							 		   (celula.peca.ehBranca() && vizinho.peca.ehPreta());
					if(vizinhoDoVizinho.distancia(celula) == 4)
					{
						if(vizinhoDoVizinho.peca.ehVazia() && corDiferente)
						{
							this.pulos.push({destino: vizinhoDoVizinho, meio: vizinho});
							vizinhoDoVizinho.pulo = true;
						}
					}
				}
			}
		};
		this.selecionar = function(celula)
		{
			this.desmarcarTodas();
			this.marcarPulos(celula);
			if(this.pulos.length == 0)
			{
				console.log("sem pulos");
				var vizinhos = celula.vizinhos;
				for(var i = 0; i < vizinhos.length; i++)
					this.marcar(vizinhos[i]);	
			}
			this.selecionada = celula;
		};
		this.criarCelulas();
		this.assinalarVizinhanca();
		this.adicionarPecas(pecas);

	}
};

window.onload = function () {

	var tabuleiro = new DamasJS.Tabuleiro(8, 8, 12);
	GUI.desenharTabuleiro('#tabuleiro', tabuleiro);
	
}