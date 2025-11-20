import { getApiBaseUrl, getWsBaseUrl } from "@config/api";

const getServerCapabilities = async (server) => {
  const endpoint = getApiBaseUrl();
  const websocketEndpoint = getWsBaseUrl();

  // Initialize server properties
  let serverInfo = {
    ...server,
    endpoint,
    websocketEndpoint,
    offline: true,
    guestUserEnabled: true,
    corsEnabled: true,
  };

  // Poll the server
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const signal = controller.signal;

    const response = await fetch(`${endpoint}getServerData`, {
      credentials: "include",
      signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server responded ${response.status}`);
    }

    const json = await response.json();

    if (json?.info) {
      serverInfo = {
        ...serverInfo,
        guestUserEnabled: json.serverData.ENABLE_GUEST_USER,
        offline: false,
        machine: json.serverData.MACHINE,
        client_version: json.serverData.MARXAN_CLIENT_VERSION,
        server_version: json.serverData.MARXAN_SERVER_VERSION,
        node: json.serverData.NODE,
        processor: json.serverData.PROCESSOR,
        processor_count: json.serverData.PROCESSOR_COUNT,
        ram: json.serverData.RAM,
        release: json.serverData.RELEASE,
        system: json.serverData.SYSTEM,
        version: json.serverData.VERSION,
        wdpa_version: json.serverData.WDPA_VERSION,
        planning_grid_units_limit: Number(
          json.serverData.PLANNING_GRID_UNITS_LIMIT
        ),
        disk_space: json.serverData.DISK_FREE_SPACE,
        shutdowntime: json.serverData.SHUTDOWNTIME,
        enable_reset: json.serverData.ENABLE_RESET,
        name: json.serverData.SERVER_NAME || server.name,
        description: json.serverData.SERVER_DESCRIPTION || server.description,
      };
    }
  } catch (error) {}
  return serverInfo;
};

const addLocalServer = (servers) => {
  return [
    ...servers,
    {
      name: window.location.hostname,
      host: window.location.hostname,
      description: "Local machine",
      type: "local",
    },
  ];
};

// function to filter and sort the servers
const filterAndSortServers = (servers) =>
  servers
    .filter(
      (server) =>
        server.type === "remote" ||
        (server.type === "local" && !server.offline) ||
        server.host === "localhost"
    )
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

export { addLocalServer, getServerCapabilities, filterAndSortServers };
