import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

/** 密码加盐哈希（NFR-05：bcrypt cost 10，禁止明文/可逆加密） */
@Injectable()
export class PasswordService {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
