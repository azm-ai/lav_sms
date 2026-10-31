<!-- Main navbar -->
<div class="navbar navbar-expand-md navbar-dark">
        <div class="mt-1 mr-4">
        <a href="{{ route('dashboard') }}" class="d-inline-flex align-items-center">
            <img src="{{ Qs::getLogo() }}" alt="{{ Qs::getSystemName() }}" style="height: 38px; width: auto; max-width: 180px;">
        </a>
    </div>

    <div class="d-md-none">
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-mobile">
            <i class="icon-tree5"></i>
        </button>
    </div>

    <div class="collapse navbar-collapse" id="navbar-mobile">
        <ul class="navbar-nav ml-auto">
            <li class="nav-item dropdown">
                <a href="{{ route('home') }}" class="navbar-nav-link">
                    <i class="icon-home"></i>
                    <span class="d-md-none ml-2">Home</span>
                </a>
            </li>

            <li class="nav-item dropdown">
                <a href="{{ route('login') }}" class="navbar-nav-link">
                    <i class="icon-user-tie"></i>
                    <span class="d-md-none ml-2">My Account</span>
                </a>
            </li>

            <li class="nav-item dropdown">
                <a href="#" class="navbar-nav-link">
                    <i class="icon-cog3"></i>
                    <span class="d-md-none ml-2">Options</span>
                </a>
            </li>
        </ul>
    </div>
</div>
<!-- /main navbar -->
