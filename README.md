# Dashboard Fiscalização — Lojas Maia + Líder Colchões

## Como instalar e rodar (Windows)

### Método FÁCIL (recomendado):

1. Extraia a pasta `dashboard-fiscalizacao` para o Desktop (Área de Trabalho)
2. Abra a pasta
3. Dê dois cliques no arquivo `INICIAR.bat`
4. Aguarde a instalação (1-2 minutos na primeira vez)
5. O navegador abre automaticamente com o dashboard

Para usar novamente, basta dar dois cliques no `INICIAR.bat` de novo.

---

### Método MANUAL (se o .bat não funcionar):

1. Aperte `Windows + R` no teclado
2. Digite `cmd` e aperte Enter
3. Cole estes comandos um por um:

```
cd %USERPROFILE%\Desktop\dashboard-fiscalizacao
npm install
npm run dev
```

4. Abra o navegador e acesse: http://localhost:3000

---

### Conectando a API do Meta:

1. Acesse: https://developers.facebook.com/tools/explorer
2. Selecione seu App no dropdown
3. Adicione as permissões necessárias
4. Clique em "Generate Access Token"
5. No dashboard, cole o token no campo do wizard de configuração

---

### Dúvidas comuns:

**"npm não é reconhecido como comando"**
→ Reinstale o Node.js: https://nodejs.org (versão LTS)
→ Marque a opção "Add to PATH" durante a instalação

**"A porta 3000 já está em uso"**
→ Feche outras aplicações ou mude a porta no arquivo `vite.config.js`

**O dashboard some quando fecho o terminal**
→ Normal! O terminal precisa ficar aberto. Minimize ele.
