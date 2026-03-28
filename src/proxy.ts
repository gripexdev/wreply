import { withAuth } from "next-auth/middleware";

const proxy = withAuth({
  pages: {
    signIn: "/sign-in",
  },
});

export default proxy;
export { proxy };

export const config = {
  matcher: ["/dashboard/:path*"],
};
