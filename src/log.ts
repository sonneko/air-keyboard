export function log(message: unknown) {
  const e = document.getElementById("console");
  if (e) e.innerText = JSON.stringify(message);
}
