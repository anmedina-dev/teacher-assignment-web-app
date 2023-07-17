import { signIn, signOut, useSession } from "next-auth/react";

export const Header = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="navbar bg-base-100 bg-primary text-primary-content">
      <div className="flex-1">
        <a className="btn-ghost btn text-xl normal-case">
          {sessionData?.user ? (
            <>{sessionData.user.name}'s </>
          ) : (
            <>Teacher Assignment</>
          )}
          Assignment Web App
        </a>
      </div>
      <div className="flex-none gap-2">
        {sessionData ? (
          <div className="dropdown-end dropdown">
            <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
              <div className="w-10 rounded-full">
                <img src={sessionData.user.image ?? ""} />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box menu-sm z-[1] mt-3 w-52 bg-base-100 p-2 shadow"
            >
              <li>
                <a className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </a>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <a onClick={() => signOut()}>Logout</a>
              </li>
            </ul>
          </div>
        ) : (
          <div className="navbar-end">
            <a className="btn" onClick={() => signIn()}>
              Button
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
