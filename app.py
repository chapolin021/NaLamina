from flask import Flask, request, render_template, redirect, url_for
import smtplib
import email.message
from mysql import connector
from flask import jsonify

app = Flask(__name__)

# Página de login
@app.route('/')
def login():
    return render_template('NaLaminalogin-teste.html')

# Página principal após login
@app.route('/pagina-principal')
def pagina_principal():
    return render_template('NaLamina-teste.html')

# Página de cadastro
@app.route("/cadastro-pagina")
def cadastro_pagina():
    return render_template("CadastroNaLamina.html")

# Cadastro de novo usuário
@app.route("/cadastro", methods=["POST"])
def cadastro():
    email_user = request.form["gmail"].strip()
    senha = request.form["senha"].strip()

    conect = connector.connect(
        host="CHAPOLIN021.mysql.pythonanywhere-services.com",
        database="CHAPOLIN021$nla",
        user="CHAPOLIN021",
        password="chg5621q"
    )

    cursor = conect.cursor()
    query = "INSERT INTO login (email, senha) VALUES (%s, %s)"
    cursor.execute(query, (email_user, senha))
    conect.commit()
    cursor.close()
    conect.close()

    enviar_email(email_user)
    return redirect(url_for("login"))

# Agendamento de horário
@app.route("/agendar", methods=["POST"])
def agendar():
    nome = request.form["name"]
    telefone = request.form["telefone"]
    servico = request.form["servico"]
    data = request.form["data"]
    horario = request.form["horario"]
    mensagem = request.form["mensagem"]

    conect = connector.connect(
        host="CHAPOLIN021.mysql.pythonanywhere-services.com",
        database="CHAPOLIN021$nla",
        user="CHAPOLIN021",
        password="chg5621q"
    )

    cursor = conect.cursor()
    query = """
        INSERT INTO agendamentos (nome, telefone, servico, data, horario, mensagem)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    dados = (nome, telefone, servico, data, horario, mensagem)
    cursor.execute(query, dados)
    conect.commit()
    cursor.close()
    conect.close()

    return redirect("/pagina-principal")

# Lista de horários (mock temporário)
@app.route('/horarios-agendados')
def horarios_agendados():
    horarios = ['10:00 - Corte', '14:00 - Barba']
    return render_template('horarios.html', horarios=horarios)

# Login do usuário
@app.route("/login", methods=["POST"])
def fazer_login():
    email_user = request.form["gmail"]
    senha = request.form["senha"]

    conect = connector.connect(
        host="CHAPOLIN021.mysql.pythonanywhere-services.com",
        database="CHAPOLIN021$nla",
        user="CHAPOLIN021",
        password="chg5621q"
    )

    cursor = conect.cursor()
    query = "SELECT * FROM login WHERE email = %s AND senha = %s"
    cursor.execute(query, (email_user, senha))
    resultado = cursor.fetchone()

    cursor.close()
    conect.close()

    if resultado:
        return redirect(url_for("pagina_principal"))
    else:
        erro = "Usuário ou senha inválidos."
        return render_template("NaLaminalogin-teste.html", erro=erro)

# Dashboard simples
@app.route("/dashboard")
def dashboard():
    return "Bem-vindo ao sistema NaLâmina!"

# Função para enviar e-mail
def enviar_email(destinatario):
    corpo_email = """
    <p>Olá!</p>
    <p>Seu cadastro foi realizado com sucesso!</p>
    """

    msg = email.message.Message()
    msg['Subject'] = "Cadastro Realizado - NaLamina"
    msg['From'] = 'gui7821q@gmail.com'
    msg['To'] = destinatario
    password = 'kypt mcqj qejx nurx'

    msg.add_header('Content-Type', 'text/html')
    msg.set_payload(corpo_email)

    s = smtplib.SMTP('smtp.gmail.com', 587)
    s.starttls()
    s.login(msg['From'], password)
    s.sendmail(msg['From'], [msg['To']], msg.as_string().encode('utf-8'))
    s.quit()

    print('Email enviado')

@app.route("/api/horarios")
def api_horarios():
    email_user = request.args.get("usuario")  # opcional, pode ser None

    conect = connector.connect(
        host="CHAPOLIN021.mysql.pythonanywhere-services.com",
        database="CHAPOLIN021$nla",
        user="CHAPOLIN021",
        password="chg5621q"
    )

    cursor = conect.cursor()

    if email_user:
        query = "SELECT data, horario, servico FROM agendamentos WHERE email = %s ORDER BY data, horario"
        cursor.execute(query, (email_user,))
    else:
        query = "SELECT data, horario, servico FROM agendamentos ORDER BY data, horario"
        cursor.execute(query)

    resultados = cursor.fetchall()
    cursor.close()
    conect.close()

    horarios_formatados = [
        f"{data.strftime('%d/%m/%Y')} - {horario} - {servico}"
        for (data, horario, servico) in resultados
    ]

    return jsonify(horarios_formatados)