/** svg-captcha 无官方类型：按实际 API 最小声明 */
declare module 'svg-captcha' {
  interface CaptchaResult {
    data: string; // SVG 字符串
    text: string; // 验证码答案
  }
  interface CreateOptions {
    size?: number;
    ignoreChars?: string;
    noise?: number;
    width?: number;
    height?: number;
    background?: string;
  }
  function create(options?: CreateOptions | string): CaptchaResult;
}
