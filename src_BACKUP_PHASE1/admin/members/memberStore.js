import {
  create,
} from "zustand";

const useMemberStore =
  create(
    (
      set
    ) => ({

      members:
        [],

      memberMetrics:
        {},

      setMembers:
        (
          members
        ) => {

          set({
            members,
          });

        },

      setMemberMetrics:
        (
          memberMetrics
        ) => {

          set({
            memberMetrics,
          });

        },

    })
  );

export default
  useMemberStore;