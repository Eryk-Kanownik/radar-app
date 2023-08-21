var socket = io();

var user = document.getElementById("user");
var userDataWrapper = document.getElementById("user-data");

var listOfUsers = document.getElementById("list-of-users");
var fakeUserBtn = document.getElementById("fake-user");
var getConstants = document.getElementById("get-constants");

var sn = document.querySelector(".sn");
var we = document.querySelector(".we");

var scale = document.getElementById("scale");
var username = prompt("Username: ");

//1deg how many meters
let DEG_METER = 111_000;

let INNER_WIDTH = 0;
let INNER_HEIGHT = 0;

let SCALE = 0.1;

let LEFT = 0;
let RIGHT = 0;

let TOP = 0;
let BOTTOM = 0;

let userCurrentData;
let otherUsersData;

window.addEventListener("load", () => {
  INNER_WIDTH = window.innerWidth;
  INNER_HEIGHT = window.innerHeight;

  navigator.geolocation.getCurrentPosition((position) => {
    let {
      coords: { latitude, longitude },
    } = position;
    let userObj = {
      username,
      latitude,
      longitude,
    };

    userCurrentData = userObj;

    LEFT = longitude - SCALE;
    RIGHT = longitude + SCALE;
    BOTTOM = latitude - SCALE;
    TOP = latitude + SCALE;
    scale.innerHTML = `Distance: ${Math.round(
      (RIGHT - LEFT) * DEG_METER
    )} meters on y axles`;
    createUserElement(userObj);
    socket.emit("registration", userObj);
  });
});

window.addEventListener("resize", () => {
  INNER_WIDTH = window.innerWidth;
  INNER_HEIGHT = window.innerHeight;
});

window.addEventListener("wheel", (e) => {
  if (e.deltaY > 0) {
    SCALE += 0.1;
  } else if (e.deltaY < 0) {
    if (SCALE > 0.1) {
      SCALE -= 0.1;
      if (SCALE < 0.1) {
        SCALE = 0.1;
      }
    } else {
      SCALE = 0.1;
    }
  }

  SCALE.toFixed(1);

  LEFT = userCurrentData.longitude - SCALE;
  RIGHT = userCurrentData.longitude + SCALE;
  BOTTOM = userCurrentData.latitude - SCALE;
  TOP = userCurrentData.latitude + SCALE;

  scale.innerHTML = `Distance: ${Math.round(
    (RIGHT - LEFT) * DEG_METER
  )} meters on y axles`;

  listOfUsers.innerHTML = "";

  otherUsersData.forEach((otherUserData) => {
    createOtherUserElement(otherUserData);
  });
});

navigator.geolocation.watchPosition((position) => {
  let {
    coords: { latitude, longitude },
  } = position;
  console.log(latitude, longitude);
});

socket.on("data", (data) => {
  let filtered = data.users.filter((user) => user.username !== username);
  listOfUsers.innerHTML = "";
  filtered.forEach((user) => {
    createOtherUserElement(user);
  });
});

socket.on("users", (users) => {
  let filtered = users.filter((user) => user.username !== username);
  otherUsersData = filtered;
  listOfUsers.innerHTML = "";
  filtered.forEach((user) => {
    createOtherUserElement(user);
  });
});

function createUserElement(obj) {
  let dot = document.createElement("div");
  dot.className = "dot user-dot";

  let header = document.createElement("p");
  let longitude = document.createElement("p");
  let latitude = document.createElement("p");

  header.innerText = obj.username;
  longitude.innerText = obj.longitude;
  latitude.innerText = obj.latitude;

  userDataWrapper.appendChild(header);
  userDataWrapper.appendChild(longitude);
  userDataWrapper.appendChild(latitude);

  user.appendChild(dot);
}

function createOtherUserElement(otherUser) {
  let wrapper = document.createElement("div");
  let dot = document.createElement("div");
  let header = document.createElement("p");
  let longitude = document.createElement("p");
  let latitude = document.createElement("p");
  let metersAway = document.createElement("p");

  let dataWrapper = document.createElement("div");

  wrapper.className = "user-other";

  wrapper.style.left = `${
    ((otherUser.longitude - LEFT) / (RIGHT - LEFT)) * 100
  }%`;
  wrapper.style.bottom = `${
    ((otherUser.latitude - BOTTOM) / (TOP - BOTTOM)) * 100
  }%`;

  dot.className = "user-dot-other dot";
  dot.addEventListener("click", () => {
    if (dataWrapper.style.display === "none") {
      dataWrapper.style.display = "flex";
    } else if (dataWrapper.style.display === "flex") {
      dataWrapper.style.display = "none";
    }
  });

  dataWrapper.style.display = "none";
  dataWrapper.style.backgroundColor = "black";
  dataWrapper.style.flexFlow = "column";
  dataWrapper.style.gap = "0.5rem";
  dataWrapper.style.fontSize = "1.5rem";
  dataWrapper.style.padding = "0.5rem";
  dataWrapper.style.marginBottom = "1rem";
  dataWrapper.style.borderRadius = "5px";

  header.innerText = otherUser.username;
  longitude.innerText = otherUser.longitude;
  latitude.innerText = otherUser.latitude;
  metersAway.innerText = countDistance(
    { x1: otherUser.longitude, y1: otherUser.latitude },
    { x2: userCurrentData.longitude, y2: userCurrentData.latitude }
  );

  dataWrapper.appendChild(header);
  dataWrapper.appendChild(longitude);
  dataWrapper.appendChild(latitude);
  dataWrapper.appendChild(metersAway);

  wrapper.appendChild(dot);
  wrapper.appendChild(dataWrapper);

  listOfUsers.appendChild(wrapper);
}

function createFakeUser() {
  let userObj = {
    username: "FakeUser",
    latitude: parseFloat((Math.random() * (TOP - BOTTOM) + BOTTOM).toFixed(4)),
    longitude: parseFloat((Math.random() * (RIGHT - LEFT) + LEFT).toFixed(4)),
  };

  console.log(parseFloat((Math.random() * (TOP - BOTTOM) + BOTTOM).toFixed(4)));
  console.log(parseFloat((Math.random() * (RIGHT - LEFT) + LEFT).toFixed(4)));

  socket.emit("registration", userObj);
}

fakeUserBtn.addEventListener("click", () => {
  createFakeUser();
});

getConstants.addEventListener("click", () => {
  console.log("SCALE", SCALE);
  console.log("TOP", TOP);
  console.log("RIGHT", RIGHT);
  console.log("LEFT", LEFT);
  console.log("BOTTOM", BOTTOM);
});

function countDistance({ x1, y1 }, { x2, y2 }) {
  let a = Math.pow(x2 - x1, 2);
  let b = Math.pow(y2 - y1, 2);
  let result = (Math.sqrt(a + b) * DEG_METER).toFixed(1);

  if (result > 1000) {
    result = (result / 1000).toFixed(1);
    result += " km away";
  } else if (result > 0 && result < 1000) {
    result += " m away";
  }

  return result;
}
