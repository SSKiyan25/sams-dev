export type Member = {
  firstName: string;
  lastName: string;
  programId: string;
  facultyId: string;
  role: "admin" | "user";
};

export type Program = {
  id: string;
  name: string;
};

export type Faculty = {
  id: string;
  name: string;
};

export type MemberData = {
  id: string;
  member: Member;
};
