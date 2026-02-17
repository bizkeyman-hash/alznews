declare module "google-news-decoder" {
  interface DecodeResult {
    status: boolean;
    decodedUrl: string;
  }

  class GoogleNewsDecoder {
    decodeGoogleNewsUrl(url: string): Promise<DecodeResult>;
  }

  export default GoogleNewsDecoder;
}
