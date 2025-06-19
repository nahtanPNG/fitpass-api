import { Gym } from "@prisma/client";
import { GymsRepository } from "../gyms-repository";

export class InMemoryGymsRepository implements GymsRepository {
  public entries: Gym[] = [];

  async findById(id: string) {
    const gym = this.entries.find((entry) => entry.id === id);

    if (!gym) {
      return null;
    }

    return gym;
  }
}
