import { CheckIn, Prisma } from "@prisma/client";

export interface CheckInsRepository {
  // UncheckedCrete is used because the relational tables already exists
  create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn>;
  findByUserIdonDate(userId: string, date: Date): Promise<CheckIn | null>;
}
