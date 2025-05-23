
document.addEventListener("DOMContentLoaded", () => {
function resetPopupState() {
  popupPasswordInput.value = "";
  popupRetypeInput.value = "";
  popupPasswordInput.setAttribute("type", "password");
  popupRetypeInput.setAttribute("type", "password");

  document.getElementById("togglePassword").querySelector("img").src = "mynaui--eye.svg";
  document.getElementById("toggleRetype").querySelector("img").src = "mynaui--eye.svg";

  warningEl.style.display = "none";
  warningEl.textContent = "";
  noteEl.style.display = isRegisterFlow ? "block" : "none";

  popupPasswordInput.classList.remove("shake");
  popupRetypeInput.classList.remove("shake");
  popupPasswordInput.style.border = "";
  popupRetypeInput.style.border = "";
}

  const joinButton = document.getElementById("joinButton");
  const nicknameInput = document.getElementById("nicknameInput");
  nicknameInput.addEventListener("input", () => {
  nicknameInput.value = nicknameInput.value.toUpperCase();
});
  const authPopup = document.getElementById("authPopup");
  const popupPasswordInput = document.getElementById("popupPasswordInput");
  const popupRetypeInput = document.getElementById("popupRetypeInput");
  const popupConfirmButton = document.getElementById("popupConfirmButton");
  const popupCancelButton = document.getElementById("popupCancelButton");
  const retypeGroup = document.getElementById("retypeGroup");
  const noteEl = document.querySelector(".password-note"); // ⬅️ fix: pindahkan ke sini
  const warningEl = document.getElementById("passwordWarning");

  const togglePassword = document.getElementById("togglePassword");
  const toggleRetype = document.getElementById("toggleRetype");

togglePassword.addEventListener("click", () => {
  const isShown = popupPasswordInput.getAttribute("type") === "text";
  popupPasswordInput.setAttribute("type", isShown ? "password" : "text");
  togglePassword.querySelector("img").src = isShown ? "mynaui--eye.svg" : "mynaui--eyeclose.svg";
});

toggleRetype.addEventListener("click", () => {
  const isShown = popupRetypeInput.getAttribute("type") === "text";
  popupRetypeInput.setAttribute("type", isShown ? "password" : "text");
  toggleRetype.querySelector("img").src = isShown ? "mynaui--eye.svg" : "mynaui--eyeclose.svg";
});

  const popupStates = {
    register: document.getElementById("popupStateRegister"),
    login: document.getElementById("popupStateLogin"),
    error: document.getElementById("popupStateError")
  };

  let currentNickname = "";
  let isRegisterFlow = false;

  joinButton.addEventListener("click", async () => {
  let nickname = nicknameInput.value.trim().toUpperCase();

  if (!nickname) {
    nickname = window.coolNicknames[Math.floor(Math.random() * window.coolNicknames.length)];
    localStorage.setItem("nickname", nickname);
    window.location.href = "select-mode.html"; 
    return;
  }

    currentNickname = nickname;
    const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("nickname", nickname)
    .single();

    // Reset view
Object.values(popupStates).forEach(el => el.classList.remove("active"));
resetPopupState();
authPopup.style.display = "flex";

if (error && error.code === "PGRST116") {
  isRegisterFlow = true;
  popupStates.register.classList.add("active");
  authPopup.dataset.mode = "register";

  document.getElementById("registerNicknameTitle").style.display = "block";
  const registerTitle = document.getElementById("registerNicknameTitle");
  registerTitle.textContent = `${nickname} IS NOT REGISTERED YET`;
  registerTitle.style.display = "block";
  popupConfirmButton.textContent = "CREATE";
  noteEl.style.display = "block";

} else if (data) {
  isRegisterFlow = false;
  popupStates.login.classList.add("active");
  authPopup.dataset.mode = "login";

document.getElementById("loginWelcomeTitle").textContent = `OH LOOK, ITS ${nickname}`;
  document.getElementById("registerNicknameTitle").style.display = "none";
  popupConfirmButton.textContent = "LOGIN";
  noteEl.style.display = "none";
}
});

popupCancelButton.addEventListener("click", () => {
  authPopup.style.opacity = "0"; // for smooth fade (optional)
  authPopup.style.pointerEvents = "none";

  setTimeout(() => {
    authPopup.style.display = "none";
    authPopup.style.opacity = "1";
    authPopup.style.pointerEvents = "auto";

    resetPopupState(); // ✅ reset isi dan warning di sini
    Object.values(popupStates).forEach(el => el.classList.remove("active"));
  }, 200); // ⏱️ delay sejenak agar transisi smooth
});

  popupConfirmButton.addEventListener("click", async () => {
    const password = popupPasswordInput.value;
    const retype = popupRetypeInput.value;
    const warningEl = document.getElementById("passwordWarning");
    const noteEl = document.querySelector(".password-note");

// Reset
warningEl.style.display = "none";
warningEl.textContent = "";
popupPasswordInput.classList.remove("shake");
popupRetypeInput.classList.remove("shake");

if (isRegisterFlow) {
  // Reset styles
    popupPasswordInput.value = "";
    popupRetypeInput.value = "";
    warningEl.style.display = "none";
    warningEl.textContent = "";
    popupPasswordInput.classList.remove("shake");
    popupRetypeInput.classList.remove("shake");
    popupPasswordInput.style.border = "";
    popupRetypeInput.style.border = "";
    noteEl.style.display = "none";

  if (!password || !retype) {
    warningEl.textContent = "Fill out all the input";
    warningEl.style.display = "block";

    if (!password) {
      popupPasswordInput.classList.add("shake");
      popupPasswordInput.style.border = "1px solid red";
    }
    if (!retype) {
      popupRetypeInput.classList.add("shake");
      popupRetypeInput.style.border = "1px solid red";
    }

    return;
  }

  if (password.length < 8) {
    warningEl.textContent = "Wow. Bold move. Unfortunately, it's too short";
    warningEl.style.display = "block";
    noteEl.style.display = "none";
    popupPasswordInput.classList.add("shake");
    return;
  }

  if (password === "12345678") {
    warningEl.textContent = "12345678 detected. What is this, 2006? 💀";
    warningEl.style.display = "block";
    noteEl.style.display = "none";
    popupPasswordInput.classList.add("shake");
    return;
  }

  if (password !== retype) {
    warningEl.textContent = "Passwords do not match!";
    warningEl.style.display = "block";
    noteEl.style.display = "none";
    popupRetypeInput.classList.add("shake");
    return;
  }
}


    const hashed = await hashPassword(password);

    if (isRegisterFlow) {
      const insertRes = await supabase
        .from("players")
        .insert([{ nickname: currentNickname, password_hash: hashed }]);

      if (insertRes.error) {
        alert("Register failed: " + insertRes.error.message);
        return;
      }

      localStorage.setItem("nickname", currentNickname);
      localStorage.setItem("isRegisteredUser", "true");
      window.location.href = "select-mode.html";
    } else {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("nickname", currentNickname)
        .single();

      if (error || !data) {
        alert("User not found.");
        return;
      }

      if (data.password_hash !== hashed) {
        warningEl.textContent = "Oopsie, wrong password.";
        warningEl.style.display = "block";
        popupPasswordInput.classList.add("shake");
        return;
      }

      localStorage.setItem("nickname", currentNickname);
      localStorage.setItem("isRegisteredUser", "true");
      window.location.href = "select-mode.html";
    }
  });
  document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const active = document.activeElement;
  const popupVisible = authPopup.style.display === "flex";
  const mode = authPopup.dataset.mode; // "login" or "register"

  // 1. Nickname input (main page)
  if (active === nicknameInput && !popupVisible) {
    e.preventDefault();
    joinButton.click();
  }

  // 2. Password input (popup)
  if (popupVisible && active === popupPasswordInput) {
    e.preventDefault();
    popupConfirmButton.click();
  }

  // 3. Retype input (only for register)
  if (popupVisible && active === popupRetypeInput && mode === "register") {
    e.preventDefault();
    popupConfirmButton.click();
  }
});

});

async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
