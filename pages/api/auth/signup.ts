/* eslint-disable no-console */
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Data from "../../../lib/data";
import { StoredUserType } from "../../../types/user";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  /**
   * 회원 가입 API 흐름
   * 1. api method가 POST 인지 확인
   * 2. req.body에 필요한 값이 전부 들어 있는지 확인
   * 3. email이 중복인지 확인
   * 4. password를 암호화
   * 5. 유저 정보를 추가
   * 6. 추가된 유저의 정보와 token을 전달
   */
  if (req.method === "POST") {
    const { email, firstname, lastname, password, birthday } = req.body;
    if (!email || !firstname || !lastname || !password || !birthday) {
      res.statusCode = 400;
      return res.send("필수 데이터가 없습니다.");
    }

    const userExist = Data.user.exist({ email });
    if (userExist) {
      res.statusCode = 409;
      return res.send("이미 가입된 이메일 입니다.");
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const users = Data.user.getList();
    let userId;
    if (users.length === 0) {
      userId = 1;
    } else {
      userId = users[users.length - 1].id + 1;
    }

    const newUser: StoredUserType = {
      id: userId,
      email,
      firstname,
      lastname,
      password: hashedPassword,
      birthday,
      profileImage: "/static/image/user/default_user_profile_image.jpg",
    };

    Data.user.write([...users, newUser]);

    await new Promise((resolve) => {
      const token = jwt.sign(String(newUser.id), process.env.JWT_SECRET!);
      res.setHeader(
        "Set-Cookie",
        `access_token=${token}; path=/; expires=${new Date(
          Date.now() + 60 * 60 * 24 * 1000 * 3
        ).toISOString()}; httponly`
      );
      resolve(token);
    });

    const newUserWithoutPassword: Partial<Pick<StoredUserType, "password">> =
      newUser;
    delete newUserWithoutPassword.password;

    res.statusCode = 201;
    console.log(res.getHeaders());
    return res.send(newUser);
  }

  res.statusCode = 405;
  return res.end();
};
