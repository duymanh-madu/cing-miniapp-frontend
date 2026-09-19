import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  getState: vi.fn(),
  getPersistedAuthSession: vi.fn(),
}));

vi.mock("@/stores/auth", () => ({
  default: {
    getState: mocks.getState,
  },
}));

vi.mock("./persistedAuthSession.js", () => ({
  getPersistedAuthSession:
    mocks.getPersistedAuthSession,
}));

import {
  commitProfileEnrichment,
} from "./commitProfileEnrichment.js";

const original = {
  id: "customer-A",
  phone: "0980000000",
  name: "Old name",
};

let auth;
let persisted;
let writes;

function commit() {
  return commitProfileEnrichment({
    expectedCustomerId: "customer-A",
    expectedPhone: "0980000000",
    expectedRefreshToken: "refresh-A",
    profile: {
      name: "Updated name",
    },
  });
}

beforeEach(() => {
  writes = [];

  auth = {
    authenticated: true,
    accessToken: "access-A",
    refreshToken: "refresh-A",
    profile: { ...original },
    updateProfile: vi.fn((profile) => {
      auth.profile = profile;
    }),
  };

  persisted = {
    session: {
      accessToken: "access-A",
      refreshToken: "refresh-A",
      profile: { ...original },
    },
    accessToken: "access-A",
    refreshToken: "refresh-A",
  };

  mocks.getState.mockReturnValue(auth);
  mocks.getPersistedAuthSession
    .mockImplementation(() => persisted);

  vi.stubGlobal("localStorage", {
    setItem: vi.fn((key, value) => {
      writes.push([key, JSON.parse(value)]);
    }),
  });
});

describe("profile enrichment session authority", () => {
  it("keeps refreshed access JWT in the same session", () => {
    auth.accessToken = "access-A-new";
    persisted.accessToken = "access-A-new";
    persisted.session.accessToken = "access-A-new";

    expect(commit()).toBe(true);
    expect(writes[0][1].accessToken)
      .toBe("access-A-new");
    expect(writes[0][1].refreshToken)
      .toBe("refresh-A");
    expect(auth.profile.name)
      .toBe("Updated name");
  });

  it("does not revive a logged-out session", () => {
    auth.authenticated = false;
    auth.accessToken = null;
    auth.refreshToken = null;
    auth.profile = null;

    expect(commit()).toBe(false);
    expect(writes).toHaveLength(0);
    expect(auth.updateProfile)
      .not.toHaveBeenCalled();
  });

  it("does not overwrite another customer", () => {
    auth.profile = {
      id: "customer-B",
      phone: "0970000000",
    };
    auth.accessToken = "access-B";
    auth.refreshToken = "refresh-B";

    expect(commit()).toBe(false);
    expect(writes).toHaveLength(0);
    expect(auth.updateProfile)
      .not.toHaveBeenCalled();
  });

  it("rejects a replacement session for the same customer", () => {
    auth.accessToken = "access-A-2";
    auth.refreshToken = "refresh-A-2";
    persisted.accessToken = "access-A-2";
    persisted.refreshToken = "refresh-A-2";

    expect(commit()).toBe(false);
    expect(writes).toHaveLength(0);
  });

  it("rejects disagreement between store and persistence", () => {
    persisted.accessToken = "stale-access";

    expect(commit()).toBe(false);
    expect(writes).toHaveLength(0);
  });

  it("never mutates auth when snapshot persistence fails", () => {
    localStorage.setItem.mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    expect(commit()).toBe(false);
    expect(auth.updateProfile)
      .not.toHaveBeenCalled();
  });
});
