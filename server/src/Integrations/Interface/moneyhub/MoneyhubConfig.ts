import { ApiClientConfig, Moneyhub } from "@mft/moneyhub-api-client";

export const moneyHubClient = async (): Promise<any> => {
  const config: ApiClientConfig = {
    resourceServerUrl: "https://api.moneyhub.co.uk/v2.0",
    identityServiceUrl: "https://identity.moneyhub.co.uk",
    client: {
      client_id: process.env.MONEYHUB_CLIENT_ID || '',
      client_secret: process.env.MONEYHUB_CLIENT_SECRET || '',
      token_endpoint_auth_method: "client_secret_basic",
      id_token_signed_response_alg: "RS256",
      request_object_signing_alg: "none",
      // Make this url an env variable 
      redirect_uri: `https://qa.quidfair.com/vrp/vrp-redirect`,
      response_type: "code id_token",
      keys: [
        {
          kty: "RSA",
          n: "tRRl_QYowlRvUfQ23vDwZH8J33cS9J1SnoQkfvwmfZVmxQ8M_hmfE-FykxyfqU58ke80svEanmj6MjsBZKoI52YxKeK5_4uOS9257jwLjTYv04qNiwHJiPaqT_dtgsiZUdrXPObENEm33Eu_L0UUji06mQaAbZ8bxALO6ouPseMvY95Fu3yhchGIXxRvQNZ5JJSl8cH-gSuL8VTwUGYGyPIeCfEtLqCKXfk4ktH54UtrTTeAxDousr_yBfYGH0SBYGTPdUFERLgk458KhkagFUbeeIre0ByR0QBWLvt8DqjiBhEniwplt67x1kbQCC-lfiD5SZvdoJCWKzWQfOlUjQ",
          e: "AQAB",
          d: "icqh6S5cqbOymfxqHK_fXbnF-4QSqo1kpzcKxo59g6bCc0WGr30zrd8qXoOzgxQ0eqA5y8joZo6fhMWdw8oXyG3dD3B19N1vRI_Owlhyudv3_NM77gFIKK763qr7bD_VW5JZowA_YUKPZFVHgGLix2XnZzapV8FxUXCJn7TffY6JTB1eRJeIcNXEDYuqfVlRchrFmrCIVnwK24sGrP3vJnI0qpakh7Mt-G5M_7JnOXTfNQHsSuvJAebTRE2KUGoyxt24hZgCSEmHzwryZsw3wzV5gb2JiTuEk2Np27oX8kghqIXvl753As1d3CcMa5THeYzyebgkdTGg7hDVvhMyAQ",
          p: "3uHdO1nH6FuIiqmNp5Jbb35LpGRWIcAqleiP7hdMG6Qak8cv46vicbDoD07Q_xtY6DLeARf8YLJUxt_Xttni8ZXtQqF8rBe5MXyJSSo8fBO2tJ65CqandI7pjlAZI9X80t7ma6Iq8ooI1CP_9pOmWmNUhS57tML9t71-YjtsPE0",
          q: "z_xrswMmlemWI1xPc96M3eqZQIVUml1AJ-wYZMXgAN3E2VdNXtU3ZikovyjM1zCJHwDXYdqgPftoyntw1IXNTfSUEvmwvUHuPxNV721wQBQELGapvbRpaUdDcdm1wg8M757g77ownVEL6Ch2VxiFIUQmla9VGqOoqhctxbH0mUE",
          dp: "qoMtV2yWTaNJUJvqrVqA7Uk34WqJooR7j_g9tK7KIRNo6cmnT4x-TvBCeQOZTLHFUM8pnLiW8fs8dHFnfJIw1xYWT7VvxdDYc42NEhZn85y5WHFdq1JYJgn3kFKjCRF6vHCe45VLOgZ0PqfT-PZ4fAol7UXkiiPrKxijic9gPLk",
          dq: "RY4YAmTSWZ4lfKvZUlmh6HEVUVOFiJ4Y34EAY2sdT4za0Qh2MnnBriOjodImNuzfXoPsg6gWoMPcNqLzh887ao-ZmYLxTUmoQGXZ_lkuCe_nuWWX7H5SJkgT0RZKx5w66kPK28D7kxDQl5I4iUYE96wP700Ue_UxabiYsR2jPEE",
          qi: "tfhA_IfRPe-c74SqOYOJTVW3fdCf-DoDErqNsc5ii_ba3eyZEW30IslDx5KkdJUU0BIKKGm0390L_PYCAyBR2hDPtdE6Yqu1m-m-SzOytY50FLNcBhphGqNfktG5KzrLhbX1SFAzICTfEJjzNvVeLg0CLD_7Oma--AuRWauwBzE",
          kid: "Ga9D9OdwN0EVzbsivWE4asWZ-k7CZpIVlk1-ljBZaTU",
          use: "sig",
          alg: "RS256",
        },
      ],
    },
  };

  const moneyhub = await Moneyhub(config);
  return moneyhub;
};
