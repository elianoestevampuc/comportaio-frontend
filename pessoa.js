/* 
  --------------------------------------------------------------------------------------
  Modal com formuláro de cadastro de pessoa. 
  --------------------------------------------------------------------------------------
*/
const modalCadastroPessoa = new bootstrap.Modal('#modalCadastroPessoa');

/* 
  --------------------------------------------------------------------------------------
  Modal para mostrar as causas de comportamento.
  --------------------------------------------------------------------------------------
*/
const modalCausasComportamento = new bootstrap.Modal('#modalCausasComportamento');


let pessoa;

/*
  --------------------------------------------------------------------------------------
  Função para recuperar as pessoas cadastradas.
  --------------------------------------------------------------------------------------
*/
const recuperarPessoas = async () => {
  document.getElementById("rowPessoas").innerHTML = "";
  let url = api_pessoa + '/pessoas';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.pessoas.forEach(pessoa => preencherListagemPessoas(pessoa))
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Função inicial para recuperar as pessoas.
  --------------------------------------------------------------------------------------
*/
recuperarPessoas();

/*
  --------------------------------------------------------------------------------------
  Função para inserir uma pessoa na tabela de pessoas.
  --------------------------------------------------------------------------------------
*/
const preencherListagemPessoas = (pessoa) => {
  document.getElementById("nomePessoa").value = "";
  fecharModalCadastroPessoa();
  criarDivPessoa(pessoa);
}

/*
  --------------------------------------------------------------------------------------
  Função para abrir o modal com formulário de cadastro de pessoa.
  --------------------------------------------------------------------------------------
*/
const abrirModalCadastroPessoa = () => {
  modalCadastroPessoa.show();
}

/*
  --------------------------------------------------------------------------------------
  Função para fechar o modal com formulário de cadastro de pessoa.
  --------------------------------------------------------------------------------------
*/
const fecharModalCadastroPessoa = () => {
  modalCadastroPessoa.hide();
}

/*
  --------------------------------------------------------------------------------------
  Função para validar o cadastro da pessoa.
  --------------------------------------------------------------------------------------
*/
const validarCadastroPessoa = () => {
  let nomePessoa = document.getElementById("nomePessoa").value;
  if (nomePessoa === '') {
    alert("Informe o nome da pessoa!");
  } else {
    salvarPessoa(nomePessoa);
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para salvar uma pessoa no banco de dados.
  --------------------------------------------------------------------------------------
*/
const salvarPessoa = async (nomePessoa) => {
  const formData = new FormData();
  formData.append('nome', nomePessoa);
  let url = api_pessoa + '/pessoa';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      let pessoa = { id: data.id, nome: data.nome };
      preencherListagemPessoas(pessoa);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Função para excluir um evento da base de dados.
  --------------------------------------------------------------------------------------
*/
const excluirPessoa = (id) => {
  if (confirm("Confirma a exclusão da pessoa?")) {
    let url = api_pessoa + '/pessoa?id=' + id;
    fetch(url, {
      method: 'delete'
    })
      .then((response) => {
        document.getElementById('pessoa_' + id).innerHTML = "";
        recuperarPessoas();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para criar a div com os dados da pessoa.
  --------------------------------------------------------------------------------------
*/
const criarDivPessoa = (pessoa) => {
  let conteudo = `
                  <div class="col-3" id="pessoa_` + pessoa.id + `" style="margin-top: 2%;">
                      <div class="row">    
                          <div class="col-12">
                              <img id="face_` + pessoa.id + `" src="img/carregando.png" style="cursor:pointer;" onclick="abrirModalCausasComportamento(` + pessoa.id + `)">
                          </div>
                          <div class="col-12" style="font-size: 23px;line-height: 50px;">
                            ` + pessoa.nome + `
                          </div>                              
                          <div class="col-12">
                                <div class="d-grid gap-2" style="display: grid;place-items: center;">
                                    <button class="btn btn-success" style="width: 131px;" type="button" onclick="abrirModalCadastroRotinaDia(` + pessoa.id + `)">
                                      Rotina do dia
                                    </button>

                                    <div class="dropdown">
                                    <button class="btn btn-secondary dropdown-toggle" style="width: 131px;" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                      Ações
                                    </button>
                                    <ul class="dropdown-menu">
                                      <li><a class="dropdown-item" href="#" onclick="abrirModalCadastroEvento(` + pessoa.id + `)">Eventos</a></li>
                                      <li><a class="dropdown-item" href="#" onclick="abrirModalCadastroRotinaPadrao(` + pessoa.id + `)">Rotina padrão</a></li>
                                      <li><a class="dropdown-item" href="#" onclick="excluirPessoa(` + pessoa.id + `)">Excluir</a></li>
                                    </ul>
                                  </div>                                    
                                </div>                                
                          </div>
                      </div>
                  </div>
                `;
  document.getElementById("rowPessoas").innerHTML += conteudo;
  recuperarUltimasRotinasDia(pessoa.id);
}


/*
  --------------------------------------------------------------------------------------
  Função para recuperar as rotinas do dia.
  --------------------------------------------------------------------------------------
*/
const recuperarUltimasRotinasDia = async (id_pessoa) => {
  let dataAtual = new Date();
  dataAtual.setDate(dataAtual.getDate() - 7);

  const formData = new FormData();
  formData.append('id_pessoa', id_pessoa);
  formData.append('data_execucao', (dataAtual.toLocaleDateString()).split("/").reverse().join("-") + 'T00:00:00');
  let url = api_rotina + '/rotinasdia-data';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      for (let r of data.rotinasdia) {
        let d = new Date(r.data_execucao);
        r.dia_semana = retornarDiaSemana(d);
        r.data_execucao_format = (d.toLocaleDateString()).split("/").reverse().join("-");
      }
      recuperarTodasRotinasPadrao(id_pessoa, data.rotinasdia);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Função para recuperar as rotinas padrão da pessoa.
  --------------------------------------------------------------------------------------
*/
const recuperarTodasRotinasPadrao = async (id, rotinasdia) => {
  let url = api_pessoa + '/rotinaspadrao?' + new URLSearchParams({
    id: id
  });
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      let naoExecutado = [];
      for (let rotinaPadrao of data.rotinaspadrao) {
        let r = rotinasdia.filter(k => k.dia_semana == rotinaPadrao.diasemana &&
          k.id_evento == rotinaPadrao.id_evento &&
          k.hora == rotinaPadrao.hora);

        if (!r || r.length == 0) {
          naoExecutado.push(rotinaPadrao);
        } else {
          for (let g of r) {
            if (!g.executou) {
              rotinaPadrao.data_execucao = g.data_execucao;
              rotinaPadrao.data_execucao_format = g.data_execucao_format;
              naoExecutado.push(rotinaPadrao);
              break;
            }
          }
        }
      }


      if ((naoExecutado && naoExecutado.length > 0) && (rotinasdia && rotinasdia.length > 0)) {
        recuperarExpressao(id, "nok");
        document.getElementById("causasComportamento").innerHTML = "<strong>NÃO EXECUÇÃO DO" + (naoExecutado.length > 1 ? "S" : "") + " EVENTO" + (naoExecutado.length > 1 ? "S" : "") + ":</strong> <br>";
        for (let rotinaNaoExecutado of naoExecutado) {
          let dia = rotinaNaoExecutado.data_execucao ? 'Dia: ' + new Date(rotinaNaoExecutado.data_execucao).toLocaleDateString() : rotinaNaoExecutado.diasemana;
          document.getElementById("causasComportamento").innerHTML += dia + ' - Hora: ' + rotinaNaoExecutado.hora + ' - ' + rotinaNaoExecutado.evento + '<br>';
        }
      } else {
        recuperarExpressao(id, "ok");
        document.getElementById("causasComportamento").innerHTML = '<strong>SEM ALTERAÇÃO NO COMPORTAMENTO!</strong>';
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Função para abrir o modal com formulário de cadastro de pessoa.
  --------------------------------------------------------------------------------------
*/
const abrirModalCausasComportamento = (id) => {
  recuperarUltimasRotinasDia(id);
  modalCausasComportamento.show();
}

/*
  --------------------------------------------------------------------------------------
  Função para fechar o modal com formulário de cadastro de pessoa.
  --------------------------------------------------------------------------------------
*/
const fecharModalCausasComportamento = () => {
  modalCausasComportamento.hide();
}

/*
  --------------------------------------------------------------------------------------
  Função para recuperar a foto com a expressão da pessoa.
  --------------------------------------------------------------------------------------
*/
const recuperarExpressao = async (id, situacao) => {
  document.getElementById("face_" + id).src = 'img/carregando.png';

  var page = localStorage.getItem("page");
  page = !page || page >= 80 ? 1 : (Number(page) + 1);
  localStorage.setItem("page", page);

  let url = 'https://api.pexels.com/v1/search?query=' + (situacao == 'ok' ? 'child+face+smiling' : 'sad+child+face') + '&per_page=1&page=' + page;
  fetch(url, {
    method: 'get',
    headers: {
      'Authorization': "fUTGDEW9y6oFbVCedKSHaih4HskF2ux5xbBWd83nAymYP6cK1IOf74ZE"
    }
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("face_" + id).src = data.photos[0].src.tiny;
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}