import { expect, describe, it, vi, beforeEach, afterEach } from "vitest";
import { InMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-check-ins-repository";
import { CheckInUseCase } from "./check-in";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository";
import { Decimal } from "@prisma/client/runtime/library";
import { MaxDistanceError } from "./errors/max-distance-error";
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins-error";

let checkInsRepository: InMemoryCheckInsRepository;
let gymsRepository: InMemoryGymsRepository;
let sut: CheckInUseCase;

describe("Check in Use Case", () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository();
    gymsRepository = new InMemoryGymsRepository();
    sut = new CheckInUseCase(checkInsRepository, gymsRepository);

    await gymsRepository.create({
      id: "gym-01",
      title: "Trembo Gym",
      description: "",
      phone: "",
      latitude: -23.7010944,
      longitude: -46.7697664,
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should be able to check in", async () => {
    const { checkIn } = await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -23.7010944,
      userLongitude: -46.7697664,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  // TDD
  // red -> Test Created with errors but not implementated (error)
  // green -> success with less complexity code
  // refactor
  it("should not be able to check in twice on the same day", async () => {
    vi.setSystemTime(new Date(2025, 4, 13, 8, 0, 0)); // specific date

    await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -23.7010944,
      userLongitude: -46.7697664,
    });

    await expect(() =>
      sut.execute({
        gymId: "gym-01",
        userId: "user-01",
        userLatitude: -23.7010944,
        userLongitude: -46.7697664,
      })
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError);
  });
  it("should be able to check in on diferrent days", async () => {
    vi.setSystemTime(new Date(2025, 4, 13, 8, 0, 0));

    await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -23.7010944,
      userLongitude: -46.7697664,
    });

    vi.setSystemTime(new Date(2025, 4, 14, 8, 0, 0));

    const { checkIn } = await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -23.7010944,
      userLongitude: -46.7697664,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });
  it("should not be able to check in on distant gym", async () => {
    gymsRepository.entries.push({
      id: "gym-02",
      title: "Deca Gym",
      description: "",
      phone: "",
      latitude: new Decimal(-23.6430811),
      longitude: new Decimal(-46.6932054),
    });

    await expect(() =>
      sut.execute({
        gymId: "gym-02",
        userId: "user-01",
        userLatitude: -23.7010944,
        userLongitude: -46.7697664,
      })
    ).rejects.toBeInstanceOf(MaxDistanceError);
  });
});
