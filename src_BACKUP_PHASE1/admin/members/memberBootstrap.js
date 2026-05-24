import memberService from "./memberService";

import useMemberStore from "./memberStore";

class MemberBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const [

      members,

      metrics,

    ] = await Promise.all([

      memberService
        .getMembers(),

      memberService
        .getMemberMetrics(),

    ]);

    const store =
      useMemberStore
        .getState();

    store.setMembers(
      members
    );

    store.setMemberMetrics(
      metrics
    );

    this.initialized =
      true;

  }

}

const memberBootstrap =
  new MemberBootstrap();

export default
  memberBootstrap;