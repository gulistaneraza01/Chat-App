import { chatServerURL, userServerURL } from "./constraints";

const apiRoutes = {
  loginURL: `${userServerURL}/api/v1/login`,
  verifyURL: `${userServerURL}/api/v1/verifylogin`,
  profileURl: `${userServerURL}/api/v1/me`,
  allChatsURI: `${chatServerURL}/api/v1/chat/all`,
  usersURL: `${userServerURL}/api/v1/user/all`,
  createChat: `${chatServerURL}/api/v1/chat/new`,
  singleChatURI: `${chatServerURL}/api/v1/message`,
  sendMessage: `${chatServerURL}/api/v1/message`,
};

export default apiRoutes;
