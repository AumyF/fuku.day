{
  outputs = {nixpkgs, self}: let pkgs= nixpkgs.legacyPackages.aarch64-darwin; in {
    devShells.aarch64-darwin.default = pkgs.mkShell {
      buildInputs = with pkgs; [openssl_3 nodejs];
    };
  };
}
