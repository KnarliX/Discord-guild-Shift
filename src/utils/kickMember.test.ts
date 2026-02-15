import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GuildMember } from "discord.js";
import { kickMemberFromOldGuild } from "./kickMember.js";
import { Logger } from "./logger.js";

// Mock the Logger module
vi.mock("./logger.js", () => ({
  Logger: {
    webhook: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    },
    console: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    },
    both: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    },
  },
}));

describe("kickMemberFromOldGuild", () => {
  let mockMember: Partial<GuildMember>;
  let mockKick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockKick = vi.fn().mockResolvedValue(undefined);

    mockMember = {
      id: "123456789",
      user: {
        tag: "TestUser#1234",
      } as any,
      kickable: true,
      kick: mockKick,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Successful kick scenarios", () => {
    it("should successfully kick a member when kickable", async () => {
      const result = await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(result).toBe(true);
      expect(mockKick).toHaveBeenCalledOnce();
      expect(mockKick).toHaveBeenCalledWith("Automated Shift: User joined New Guild.");
      expect(Logger.webhook.info).toHaveBeenCalledWith(
        "👢 KICKED: TestUser#1234 (123456789) from Old Guild."
      );
      expect(Logger.webhook.error).not.toHaveBeenCalled();
    });

    it("should use correct kick reason message", async () => {
      await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(mockKick).toHaveBeenCalledWith("Automated Shift: User joined New Guild.");
    });

    it("should log correct success message with user tag and ID", async () => {
      await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(Logger.webhook.info).toHaveBeenCalledWith(
        expect.stringContaining("TestUser#1234")
      );
      expect(Logger.webhook.info).toHaveBeenCalledWith(
        expect.stringContaining("123456789")
      );
    });
  });

  describe("Non-kickable member scenarios", () => {
    it("should return false when member is not kickable", async () => {
      mockMember.kickable = false;

      const result = await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(result).toBe(false);
      expect(mockKick).not.toHaveBeenCalled();
      expect(Logger.webhook.error).toHaveBeenCalledWith(
        "❌ Cannot kick TestUser#1234 (123456789): Not kickable (permission or hierarchy issue)."
      );
      expect(Logger.webhook.info).not.toHaveBeenCalled();
    });

    it("should log detailed error when member cannot be kicked", async () => {
      mockMember.kickable = false;
      mockMember.user = { tag: "Admin#0001" } as any;
      mockMember.id = "999999999";

      await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(Logger.webhook.error).toHaveBeenCalledWith(
        "❌ Cannot kick Admin#0001 (999999999): Not kickable (permission or hierarchy issue)."
      );
    });
  });

  describe("Timeout scenarios", () => {
    it("should handle kick timeout (5 seconds)", async () => {
      mockKick.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 10000); // Takes longer than 5s timeout
          })
      );

      const kickPromise = kickMemberFromOldGuild(mockMember as GuildMember);

      // Advance time to trigger timeout
      await vi.advanceTimersByTimeAsync(5000);

      const result = await kickPromise;

      expect(result).toBe(false);
      expect(Logger.webhook.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to kick TestUser#1234")
      );
      expect(Logger.webhook.error).toHaveBeenCalledWith(
        expect.stringContaining("Kick timeout")
      );
    });

    it("should complete successfully if kick happens before timeout", async () => {
      mockKick.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 2000); // Completes before 5s timeout
          })
      );

      const kickPromise = kickMemberFromOldGuild(mockMember as GuildMember);

      await vi.advanceTimersByTimeAsync(2000);

      const result = await kickPromise;

      expect(result).toBe(true);
      expect(Logger.webhook.info).toHaveBeenCalledWith(
        "👢 KICKED: TestUser#1234 (123456789) from Old Guild."
      );
    });
  });

  describe("Error handling scenarios", () => {
    it("should handle kick errors with error code", async () => {
      const mockError = { code: 50013, message: "Missing Permissions" };
      mockKick.mockRejectedValue(mockError);

      const result = await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(result).toBe(false);
      expect(Logger.webhook.error).toHaveBeenCalledWith(
        "❌ Failed to kick TestUser#1234 (123456789) | Code: 50013 | Message: Missing Permissions"
      );
    });

    it("should handle kick errors without error code", async () => {
      const mockError = new Error("Network error");
      mockKick.mockRejectedValue(mockError);

      const result = await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(result).toBe(false);
      expect(Logger.webhook.error).toHaveBeenCalledWith(
        "❌ Failed to kick TestUser#1234 (123456789) | Code: N/A | Message: Network error"
      );
    });

    it("should handle non-Error objects thrown during kick", async () => {
      mockKick.mockRejectedValue("String error");

      const result = await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(result).toBe(false);
      expect(Logger.webhook.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to kick TestUser#1234")
      );
    });

    it("should handle null or undefined error objects", async () => {
      mockKick.mockRejectedValue(null);

      const result = await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(result).toBe(false);
      expect(Logger.webhook.error).toHaveBeenCalledWith(
        "❌ Failed to kick TestUser#1234 (123456789) | Code: N/A | Message: undefined"
      );
    });
  });

  describe("Edge cases and boundary conditions", () => {
    it("should handle member with special characters in username", async () => {
      mockMember.user = { tag: "User!@#$%^&*()#9999" } as any;

      const result = await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(result).toBe(true);
      expect(Logger.webhook.info).toHaveBeenCalledWith(
        expect.stringContaining("User!@#$%^&*()")
      );
    });

    it("should handle member with very long user tag", async () => {
      const longTag = "A".repeat(100) + "#1234";
      mockMember.user = { tag: longTag } as any;

      const result = await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(result).toBe(true);
      expect(Logger.webhook.info).toHaveBeenCalledWith(
        expect.stringContaining(longTag)
      );
    });

    it("should handle member with numeric-only ID", async () => {
      mockMember.id = "000000000000000000";

      const result = await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(result).toBe(true);
      expect(Logger.webhook.info).toHaveBeenCalledWith(
        expect.stringContaining("000000000000000000")
      );
    });

    it("should handle rapid successive calls independently", async () => {
      const member1 = { ...mockMember, id: "111", user: { tag: "User1#1111" } as any };
      const member2 = { ...mockMember, id: "222", user: { tag: "User2#2222" } as any };

      const [result1, result2] = await Promise.all([
        kickMemberFromOldGuild(member1 as GuildMember),
        kickMemberFromOldGuild(member2 as GuildMember),
      ]);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(mockKick).toHaveBeenCalledTimes(2);
    });
  });

  describe("Integration with Discord.js error codes", () => {
    it("should handle Missing Permissions error (50013)", async () => {
      mockKick.mockRejectedValue({ code: 50013, message: "Missing Permissions" });

      const result = await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(result).toBe(false);
      expect(Logger.webhook.error).toHaveBeenCalledWith(
        expect.stringContaining("Code: 50013")
      );
    });

    it("should handle Unknown Member error (10007)", async () => {
      mockKick.mockRejectedValue({ code: 10007, message: "Unknown Member" });

      const result = await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(result).toBe(false);
      expect(Logger.webhook.error).toHaveBeenCalledWith(
        expect.stringContaining("Code: 10007")
      );
    });

    it("should handle Bot lacks necessary permissions (50013)", async () => {
      mockMember.kickable = false;

      const result = await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(result).toBe(false);
      expect(Logger.webhook.error).toHaveBeenCalledWith(
        expect.stringContaining("Not kickable")
      );
    });
  });

  describe("Regression tests", () => {
    it("should not throw unhandled exceptions on kick failure", async () => {
      mockKick.mockRejectedValue(new Error("Unexpected error"));

      await expect(kickMemberFromOldGuild(mockMember as GuildMember)).resolves.toBe(false);
    });

    it("should always return a boolean value", async () => {
      const result1 = await kickMemberFromOldGuild(mockMember as GuildMember);
      expect(typeof result1).toBe("boolean");

      mockMember.kickable = false;
      const result2 = await kickMemberFromOldGuild(mockMember as GuildMember);
      expect(typeof result2).toBe("boolean");

      mockMember.kickable = true;
      mockKick.mockRejectedValue(new Error("Error"));
      const result3 = await kickMemberFromOldGuild(mockMember as GuildMember);
      expect(typeof result3).toBe("boolean");
    });

    it("should never call kick when member is not kickable", async () => {
      mockMember.kickable = false;

      await kickMemberFromOldGuild(mockMember as GuildMember);
      await kickMemberFromOldGuild(mockMember as GuildMember);
      await kickMemberFromOldGuild(mockMember as GuildMember);

      expect(mockKick).not.toHaveBeenCalled();
    });

    it("should log info only on success, error on failure", async () => {
      await kickMemberFromOldGuild(mockMember as GuildMember);
      expect(Logger.webhook.info).toHaveBeenCalledTimes(1);
      expect(Logger.webhook.error).not.toHaveBeenCalled();

      vi.clearAllMocks();
      mockKick.mockRejectedValue(new Error("Test error"));
      await kickMemberFromOldGuild(mockMember as GuildMember);
      expect(Logger.webhook.info).not.toHaveBeenCalled();
      expect(Logger.webhook.error).toHaveBeenCalledTimes(1);
    });
  });

  describe("Promise race condition tests", () => {
    it("should resolve with kick result when kick completes first", async () => {
      mockKick.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const kickPromise = kickMemberFromOldGuild(mockMember as GuildMember);
      await vi.advanceTimersByTimeAsync(1000);

      const result = await kickPromise;
      expect(result).toBe(true);
    });

    it("should reject with timeout when timeout occurs first", async () => {
      mockKick.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 6000))
      );

      const kickPromise = kickMemberFromOldGuild(mockMember as GuildMember);
      await vi.advanceTimersByTimeAsync(5000);

      const result = await kickPromise;
      expect(result).toBe(false);
      expect(Logger.webhook.error).toHaveBeenCalledWith(
        expect.stringContaining("Kick timeout")
      );
    });
  });
});