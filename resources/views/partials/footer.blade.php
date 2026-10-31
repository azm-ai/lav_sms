@if(isset($is_print) && $is_print)
    {{-- Printed / PDF Footer --}}
    <div class="print-footer" style="margin-top: 25px; padding-top: 10px; border-top: 1px solid #166534; text-align: center; font-size: 11px; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <span>{{ Qs::getSystemName() }} &bull; Made by <a href="https://tenhtech.com" target="_blank" rel="noopener noreferrer" style="color: #166534; font-weight: 700; text-decoration: none;">TenH Tech</a> (https://tenhtech.com)</span>
    </div>
@else
    {{-- Standard Web Layout Footer --}}
    <div class="navbar navbar-expand-lg navbar-light border-top-0 px-3 py-2 shaheenlms-footer {{ $footer_class ?? '' }}" style="background: transparent;">
        <div class="text-center d-lg-none w-100">
            <button type="button" class="navbar-toggler dropdown-toggle" data-toggle="collapse" data-target="#navbar-footer-shaheen">
                <i class="icon-unfold mr-2"></i>
                Footer
            </button>
        </div>

        <div class="navbar-collapse collapse" id="navbar-footer-shaheen">
            <span class="navbar-text text-muted" style="font-size: 13px;">
                &copy; {{ date('Y') }} <a href="{{ route('dashboard') }}" style="color: #166534; font-weight: 600;">{{ Qs::getSystemName() }}</a>. All rights reserved.
            </span>

            <span class="navbar-text ml-lg-auto text-muted" style="font-size: 13px;">
                Made by <a href="https://tenhtech.com" target="_blank" rel="noopener noreferrer" class="tenh-tech-link">TenH Tech</a>
            </span>

            @if(isset($show_policies) && $show_policies)
                <ul class="navbar-nav ml-lg-3">
                    <li class="nav-item"><a href="{{ route('privacy_policy') }}" class="navbar-nav-link text-muted" target="_blank"><i class="icon-lifebuoy mr-1" style="color: #16A34A;"></i> Privacy Policy</a></li>
                    <li class="nav-item"><a href="{{ route('terms_of_use') }}" class="navbar-nav-link text-muted" target="_blank"><i class="icon-file-text2 mr-1" style="color: #16A34A;"></i> Terms of Use</a></li>
                </ul>
            @endif
        </div>
    </div>
@endif
