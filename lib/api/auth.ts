import { UserType } from "../../types/user";
import client from "./index";

//* 회원 가입 body
interface SignUpAPIBody {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  birthday: string;
}

//* 회원 가입 api
export const signupAPI = (body: SignUpAPIBody) =>
  client.post<UserType>("/api/auth/signup", body);
