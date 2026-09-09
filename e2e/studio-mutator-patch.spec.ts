import { test, expect } from "@playwright/test";
import { BufferedDocument, Mutation } from "@sanity/mutator";

/**
 * Regression guard for the Studio "getAttribute only applies to plain
 * objects" crash.
 *
 * ROOT CAUSE: `@sanity/mutator`'s `Document.rebase()` calls
 * `Mutation.applyAll(this.HEAD, …)` with no guard for `this.HEAD === null`.
 * When a `delete` mutation arrives for a document that still has local
 * (pending / submitted) patch mutations — which is exactly what a
 * **publish** does to the draft — mutator tries to re-apply those patches
 * onto a null document and `Patcher.apply(null)` throws. The whole
 * Structure tool white-screens.
 *
 * The client hit it publishing Homepage / Project / Service edits (every
 * publish deletes the draft) while an image edit was still in flight.
 *
 * FIX: `patches/@sanity+mutator+5.31.2.patch` guards the null case so the
 * editor surfaces "document was deleted" instead of crashing. This test
 * reproduces the exact sequence and fails if the patch is ever lost
 * (postinstall skipped, patch not re-generated after a version bump…).
 *
 * Runs once — it is a pure library assertion, not a browser test.
 */
test.describe("@sanity/mutator delete-with-pending-edits", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Library behaviour is viewport-independent.",
  );

  test("a delete arriving with local edits does not crash the rebase", () => {
    const draft = {
      _id: "drafts.service-example",
      _type: "service",
      _rev: "rev-1",
      _updatedAt: "2026-01-01T00:00:00Z",
      heroMedia: {
        _type: "image",
        asset: { _type: "reference", _ref: "image-abc-100x100-jpg" },
        alt: "x",
      },
    };

    const buffered = new BufferedDocument(draft);
    let deleted = false;
    buffered.onRebase = () => {};
    buffered.onMutation = () => {};
    buffered.onDelete = () => {
      deleted = true;
    };

    // The client drags the hero image hotspot → a local patch that has
    // not round-tripped yet.
    buffered.document.stage(
      new Mutation({
        transactionId: "local-1",
        mutations: [
          {
            patch: {
              id: draft._id,
              set: {
                "heroMedia.hotspot": {
                  _type: "sanity.imageHotspot",
                  x: 0.5,
                  y: 0.5,
                  height: 0.3,
                  width: 0.3,
                },
              },
            },
          },
        ],
      }),
    );

    // The client hits Publish. The publish transaction deletes the draft;
    // that delete echoes back to this editor.
    const runDelete = () =>
      buffered.arrive(
        new Mutation({
          transactionId: "publish-1",
          previousRev: "rev-1",
          resultRev: "publish-1",
          timestamp: "2026-01-01T00:05:00Z",
          mutations: [{ delete: { id: draft._id } }],
        }),
      );

    expect(runDelete).not.toThrow();
    expect(buffered.document.HEAD).toBeNull();
    expect(buffered.LOCAL).toBeNull();
    expect(deleted).toBe(true);
  });

  test("a normal remote edit with local edits still rebases both", () => {
    const base = {
      _id: "drafts.service-example",
      _type: "service",
      _rev: "r1",
      _updatedAt: "2026-01-01T00:00:00Z",
      name: "Old name",
      heroMedia: {
        _type: "image",
        asset: { _type: "reference", _ref: "image-a-1x1-jpg" },
      },
    };
    const buffered = new BufferedDocument(base);
    buffered.onRebase = () => {};
    buffered.onMutation = () => {};

    buffered.document.stage(
      new Mutation({
        transactionId: "L1",
        mutations: [
          {
            patch: {
              id: base._id,
              set: {
                "heroMedia.hotspot": {
                  _type: "sanity.imageHotspot",
                  x: 0.5,
                  y: 0.5,
                  height: 0.3,
                  width: 0.3,
                },
              },
            },
          },
        ],
      }),
    );

    buffered.arrive(
      new Mutation({
        transactionId: "R1",
        previousRev: "r1",
        resultRev: "r2",
        timestamp: "2026-01-01T00:05:00Z",
        mutations: [
          { patch: { id: base._id, set: { name: "Edited elsewhere" } } },
        ],
      }),
    );

    const edge = buffered.document.EDGE as unknown as {
      name: string;
      heroMedia: { hotspot?: unknown };
    };
    expect(edge.name).toBe("Edited elsewhere");
    expect(edge.heroMedia.hotspot).toBeTruthy();
  });
});
