{
  outputs = {nixpkgs, self}: let pkgs= nixpkgs.legacyPackages.x86_64-linux; in {
    devShells.x86_64-linux.default = pkgs.mkShell {
      buildInputs = with pkgs; [openssl_3 nodejs];
    };
  };
}
