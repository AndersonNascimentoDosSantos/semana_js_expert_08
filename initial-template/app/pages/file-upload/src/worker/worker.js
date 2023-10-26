onmessage = ({ data }) => {
  let timeout = null;
  if (data.status === "start") {
    // Iniciar o temporizador
    timeout = setTimeout(() => {
      self.postMessage({ status: "done" });
    }, 2000);
  } else if (data === "cancel") {
    // Cancelar o temporizador se necessário
    if (timeout) {
      clearTimeout(timeout);
    }
  }
};
