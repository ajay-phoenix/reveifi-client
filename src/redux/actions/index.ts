export const setUser = (user: any) => {
  return { type: "USER_SET", payload: user };
};

export const getUser = () => {
  return { type: "USER_GET" };
};
