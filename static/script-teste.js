document.addEventListener("DOMContentLoaded", function () {
  // === Login Simples ===
  
  window.verificarLogin = function (event) {
    event.preventDefault();
    const usuario = document.getElementById("gmail").value;
    const senha = document.getElementById("senha").value;
    const mensagem = document.getElementById("mensagem");

    if (!usuario || !senha) {
      mensagem.style.textAlign = "center";
      mensagem.style.color = "orange";
      mensagem.textContent = "⚠️ Preencha todos os campos!";
      return false;
    }

    mensagem.style.textAlign = "center";
    mensagem.style.color = "lightgreen";
    mensagem.textContent = "✅ Entrando...";

    setTimeout(() => {
      document.getElementById("loginForm").submit();
    }, 1000);

    return false;
  };

  // === Modal Agendamento ===
  const modal = document.getElementById("modal");
  const closeBtn = document.querySelector(".close");
  const agendarBotoes = document.querySelectorAll(".btn-agendar");

  agendarBotoes.forEach(botao => {
    botao.addEventListener("click", function (e) {
      e.preventDefault();
      modal.style.textAlign = "center";
      modal.style.display = "block";
    });
  });

  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  const opcoesHorario = document.querySelectorAll(".opcao-horario");
  const mensagemHorario = document.getElementById("horario-selecionado");

  opcoesHorario.forEach(imagem => {
    imagem.addEventListener("click", function () {
      const horario = imagem.getAttribute("data-horario");

      // Destacar visualmente
      opcoesHorario.forEach(img => img.style.border = "none");
      imagem.style.border = "3px solid green";
      imagem.style.borderRadius = "100px";

      // Mostrar mensagem - usar crase para template literal
      mensagemHorario.textContent = `✅Você selecionou: ${horario}`;
      mensagemHorario.style.color = "green";
      mensagemHorario.style.display = "block";
    });
  });

  // Remover segundo DOMContentLoaded, pois já estamos dentro de um
  fetch('/api/horarios')
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById("appointment-list");
      if (data.length === 0) {
        list.innerHTML = "<p>Nenhum horário agendado.</p>";
      } else {
        const ul = document.createElement("ul");
        data.forEach(horario => {
          const li = document.createElement("li");
          li.textContent = horario;
          ul.appendChild(li);
        });
        list.innerHTML = "";
        list.appendChild(ul);
      }
    })
    .catch(error => {
      document.getElementById("appointment-list").innerHTML =
        "<p>Erro ao carregar os horários.</p>";
    });

  // === Seleção de Dias ===
  const diasContainer = document.getElementById("dias");
  let diasVisiveis = 7;
  let diaInicial = new Date();

  function formatarData(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${ano}-${mes}-${dia}`; // corrigido: template literal com crase
  }

  // Atualizar mês acima dos dias
  function atualizarMes() {
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const mesAtual = document.getElementById("mesAtual");
    if (mesAtual) {
      mesAtual.textContent = `${meses[diaInicial.getMonth()]} ${diaInicial.getFullYear()}`; // corrigido
    }
  }

  function gerarDias() {
    diasContainer.innerHTML = "";
    for (let i = 0; i < diasVisiveis; i++) {
      const novaData = new Date(diaInicial);
      novaData.setDate(diaInicial.getDate() + i);
      const diaNum = novaData.getDate();
      const diaSemana = novaData.toLocaleDateString("pt-BR", { weekday: "short" });

      const div = document.createElement("div");
      div.classList.add("dia");
      div.innerHTML = `<div>${diaSemana}</div><div>${String(diaNum).padStart(2, '0')}</div>`; // corrigido: crase para template literal
      div.dataset.data = formatarData(novaData);

      div.addEventListener("click", () => {
        document.querySelectorAll(".dia").forEach(d => d.classList.remove("selecionado"));
        div.classList.add("selecionado");

        const campoData = document.querySelector('input[name="data"]');
        if (campoData) {
          campoData.value = div.dataset.data;
          campoData.dispatchEvent(new Event("change"));
        }
      });

      if (i === 0) div.classList.add("selecionado");
      diasContainer.appendChild(div);
    }

    const campoData = document.querySelector('input[name="data"]');
    if (campoData) campoData.value = formatarData(diaInicial);

    // Atualizar mês sempre que os dias mudarem
    atualizarMes();
  }

  window.avancarDia = function () {
    diaInicial.setDate(diaInicial.getDate() + 1);
    gerarDias();
  };

  window.voltarDia = function () {
    diaInicial.setDate(diaInicial.getDate() - 1);
    gerarDias();
  };

  gerarDias();
});