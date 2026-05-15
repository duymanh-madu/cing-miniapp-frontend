import apiClient from "@/services/api/apiClient";

class ChannelService {

  async getChannels() {

    const response =
      await apiClient.get(
        "/admin/channels"
      );

    return response.data;

  }

  async getChannelHealth() {

    const response =
      await apiClient.get(
        "/admin/channels/health"
      );

    return response.data;

  }

}

const channelService =
  new ChannelService();

export default
  channelService;