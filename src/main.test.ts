import { multiRepo, singleRepo } from "./main";

describe("Tests for main", () => {
  it("Single Repo", () => {
    const result = singleRepo("security", ["3.0", "2.4"]);
    console.log(result);
  });
  it("Multiple Repo", () => {
    const result = multiRepo(["1.3.6", "2.4", "3.0"]);
    console.log(result);
  })
});